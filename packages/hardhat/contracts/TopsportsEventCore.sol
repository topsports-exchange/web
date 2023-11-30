// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {SignedMath} from "@openzeppelin/contracts/utils/math/SignedMath.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {ContextUpgradeable as Context} from "@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ITopsportsMakerCore as MakerCore} from "./interfaces/ITopsportsMakerCore.sol";
import {ITopsportsFunctionsConsumer as FunctionsConsumer} from "./interfaces/ITopsportsFunctionsConsumer.sol";

// This contract encapsulates the logic for an event, with one contract deployed for each event. Once deployed, the contract operates in a trustless manner and lacks owner logic.
// An event may have zero to many markets, and each market can host zero to many bets. Placing a bet resembles a taker order on a market created earlier by a market maker.
// The resolution of the event is asynchronous, and participants (takers and makers) can claim their payouts once the Chainlink DON has invoked the fulfillment function on this contract.

contract TopsportsEventCore is Initializable, Context {
    using Math for uint256;
    using SafeERC20 for IERC20;

    enum EventWinner {
        UNDEFINED,
        HOME_TEAM,
        AWAY_TEAM
    }

    struct Bet {
        address taker;
        uint256 stake;
        uint256 profit;
        EventWinner winner;
    }

    struct Market {
        address maker; // provisionning contract of the market maker
        int64 homeTeamOdds;
        int64 awayTeamOdds;
        uint256 limit;
        uint64 deadline;
        Bet[] bets;
    }

    struct Wager {
        uint256 totalWagered;
        uint256 totalHomePayout;
        uint256 totalAwayPayout;
    }

    error Expired();
    error UnknownError();
    error AlreadyClaimed();
    event PlaceBet();
    event ResolveEvent();

    error InvalidResolver();

    error ExpiredSignature(uint256 deadline);
    error UnexpectedRequestID(bytes32 requestId);
    error UnauthorizedConsumer(address consumer);

    // Immutable variables
    uint64 public eventId;
    uint64 public deadline; // event start time
    IERC20 public token; // stake token
    FunctionsConsumer public consumer;
    bytes32 private resolverHash; // hash of the source run by cl functions

    // State variables
    Market[] public markets;
    EventWinner public winner;
    bytes32 private lastRequestId;
    mapping(bytes32 => uint256) private signatureToMarketId;
    mapping(bytes32 => bool) private signatureToMarketExist;
    mapping(address => Wager) private wagerByAddress;

    modifier onlyConsumer() {
        if (address(consumer) != _msgSender()) revert UnauthorizedConsumer(_msgSender());
        _;
    }

    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Function to initialize this event after it has been deployed on-chain.
     *
     * @dev The initialize function sets the initial parameters for the event, including the event ID, reclaim deadline,
     * wager token address, and the Chainlink consumer contract address. It also pushes a null element to the markets array,
     * which is used to check if a market exists.
     *
     * @param _eventId The ID of the sport event in the external sport data provider API.
     * @param _deadline The date after when users can reclaim their funds if the event has not been settled by the external sport data provider.
     * @param _token The address of the token that is wagered, usually a stablecoin.
     * @param _consumer The address of the consumer contract, responsible for sending requests and receiving responses from Chainlink regarding the outcome of the event.
     */
    function initialize(
        uint64 _eventId,
        uint64 _deadline,
        address _token,
        address _consumer,
        bytes32 _resolverHash
    ) external initializer {
        eventId = _eventId;
        deadline = _deadline;
        token = IERC20(_token);
        consumer = FunctionsConsumer(_consumer);
        resolverHash = _resolverHash;
    }

    /**
     * @notice Returns data of all markets for this event.
     *
     * @dev The getAllMarkets function provides an external view to retrieve information about all markets created for the current event.
     *
     * @return markets An array containing data for all markets associated with this event.
     */
    function getAllMarkets() external view returns (Market[] memory) {
        return markets;
    }

    function not(EventWinner _winner) private pure returns (EventWinner notWinner) {
        if (_winner == EventWinner.HOME_TEAM) {
            notWinner = EventWinner.AWAY_TEAM;
        } else {
            notWinner = EventWinner.HOME_TEAM;
        }
    }

    /**
     * @notice Function to place a bet. Placing a bet is a taker order on an existing market created earlier by a market maker.
     * When placing a bet on a market, this market may not have been created on the blockchain yet. The first bettor on any market
     * will effectively register that market from a payload signed by the market maker. When a user places a bet, they pull the
     * potential return of the bet off the market maker provisionning contract. The potential return and stake are locked into
     * the event contract until the event is resolved and the winner can collect the payout of this bet.
     *
     * @dev The placeBet function processes a bet request, checks the validity of the market and user signatures, updates the
     * market information, and transfers the stake and potential profit to the event contract.
     *
     * @param _stake The amount of tokens that the taker is staking on this bet.
     * @param _winner The outcome of the event according to the user.
     * @param _homeTeamOdds The home team odds as agreed by the market maker, in American odds notation.
     * @param _awayTeamOdds The away team odds as agreed by the market maker, in American odds notation.
     * @param _limit The maximum amount of money that the market maker is willing to wager on this market.
     * @param _deadline The date after which the market maker is not willing to accept new bets for this market.
     * @param _maker Address of the provisionning contract of the market maker, where potential returns funds are pulled from.
     * @param _signature The market info, signed by the market maker wallet.
     */
    function placeBet(
        uint256 _stake,
        EventWinner _winner,
        int64 _homeTeamOdds,
        int64 _awayTeamOdds,
        uint256 _limit,
        uint64 _deadline,
        address _maker,
        bytes calldata _signature
    ) external {
        uint256 marketId;
        bytes32 sigHash = keccak256(_signature);

        if (!signatureToMarketExist[sigHash]) {
            markets.push(
                Market(_maker, _homeTeamOdds, _awayTeamOdds, _limit, _deadline, new Bet[](0))
            );
            marketId = markets.length - 1;
            signatureToMarketId[sigHash] = marketId;
            signatureToMarketExist[sigHash] = true;
            MakerCore(_maker).permit(_homeTeamOdds, _awayTeamOdds, _limit, _deadline, _signature);
        } else {
            marketId = signatureToMarketId[sigHash];
        }

        Market storage market = markets[marketId];
        if (market.deadline < block.timestamp) revert ExpiredSignature(_deadline);
        uint256 profit = getProfit(
            _stake,
            (_winner == EventWinner.HOME_TEAM) ? _homeTeamOdds : _awayTeamOdds
        );
        market.limit -= profit; // Will revert if market.limit is negative

        token.safeTransferFrom(_maker, address(this), profit);
        token.safeTransferFrom(_msgSender(), address(this), _stake);

        Bet memory bet = Bet(_msgSender(), _stake, profit, _winner);
        market.bets.push(bet);

        wagerByAddress[_msgSender()].totalWagered += _stake;
        wagerByAddress[_maker].totalWagered += profit;
        if (_winner == EventWinner.HOME_TEAM) {
            wagerByAddress[_msgSender()].totalHomePayout += _stake + profit;
            wagerByAddress[_maker].totalAwayPayout += _stake + profit;
        } else if (_winner == EventWinner.AWAY_TEAM) {
            wagerByAddress[_msgSender()].totalAwayPayout += _stake + profit;
            wagerByAddress[_maker].totalAwayPayout += _stake + profit;
        } else {
            // revert
        }

        emit PlaceBet();
    }

    /**
     * @notice Helper function to calculate the profit of a stake based on American odds.
     *
     * @dev The getProfit function takes a stake and American odds as input and computes the potential profit
     * based on the odds. The calculation is different for positive and negative odds.
     *
     * @param _stake The amount of the stake.
     * @param _odds The American odds for the bet.
     * @return profit The potential profit calculated based on the stake and odds.
     */
    function getProfit(uint256 _stake, int256 _odds) private pure returns (uint256 profit) {
        if (_odds > 0) {
            // Calculation for positive odds
            profit = _stake.mulDiv(uint256(_odds), 100);
        } else {
            // Calculation for negative odds
            profit = _stake.mulDiv(100, SignedMath.abs(_odds));
        }
    }

    /**
     * @notice Triggers the request to Chainlink for fetching the event resolution data off-chain.
     *
     * @dev This function may transfer the required amount in LINK to the consumer to initiate the request.
     * The amount transferred should cover the specified gas limit for the request.
     *
     * @param _source The data source identifier for Chainlink.
     * @param _subscriptionId The unique identifier fixed at event creation for subscription purposes.
     * @param _gasLimit The gas limit specified for the Chainlink request.
     * @param _donID The unique identifier fixed at event creation for Chainlink DON (Decentralized Oracle Network).
     */
    function resolveEvent(
        string memory _source,
        uint64 _subscriptionId, // Should be fixed at event creation
        uint32 _gasLimit,
        bytes32 _donID // Fixed at event creation
    ) public {
        if (keccak256(bytes(_source)) != resolverHash) revert InvalidResolver();

        // Create an array with event ID as a string for Chainlink request arguments
        string[] memory args = new string[](1);
        args[0] = Strings.toString(eventId);

        // Trigger the Chainlink request and store the request ID
        lastRequestId = consumer.sendRequest(_source, args, _subscriptionId, _gasLimit, _donID);

        // Emit the ResolveEvent event
        emit ResolveEvent();
    }

    /**
     * @notice This function is invoked by the FunctionsConsumer contract with the results of the request as fetched
     * by the Chainlink DON (Decentralized Oracle Network). If the API sports data indicates that the event has not yet
     * resolved, it allows calling the event resolution function at a later time. In the case where the event never
     * resolves, both market takers and makers will be able to reclaim their corresponding stakes.
     *
     * @dev The resolutionCallback function processes the response from the Chainlink oracle, sets the event winner if
     * the resolution is greater than zero, and emits the ResolveEvent event.
     *
     * @param _requestId The unique identifier of the Chainlink request.
     * @param _response The response data containing information about the event resolution.
     * @param _err The error data, which should be empty if the request was successful.
     *
     * @dev Only callable by the FunctionsConsumer contract to ensure proper access control.
     */
    function resolutionCallback(
        bytes32 _requestId,
        bytes memory _response,
        bytes memory _err
    ) external onlyConsumer {
        if (lastRequestId != _requestId) revert UnexpectedRequestID(_requestId);

        // 2. Check that err is empty
        if (_err.length > 0) revert UnknownError();

        // 3. Set winner
        uint256 resolution = abi.decode(_response, (uint256));
        if (
            (uint256(EventWinner.UNDEFINED) > resolution) &&
            (resolution <= uint256(EventWinner.AWAY_TEAM))
        ) {
            winner = EventWinner(resolution);
        } else {
            // emit UnresolvedEvent();
        }

        emit ResolveEvent();
    }

    function collect(address _to) external returns (uint256 amount) {
        if ((deadline + 24 hours > block.timestamp) && (winner == EventWinner.UNDEFINED)) {
            // Event completed without resolution of the event, release stake and
            // profit to their respective owners
            amount = wagerByAddress[_msgSender()].totalWagered;
        } else {
            // collect fees
            if (EventWinner.HOME_TEAM == winner) {
                amount = wagerByAddress[_msgSender()].totalHomePayout;
            } else if (EventWinner.AWAY_TEAM == winner) {
                amount = wagerByAddress[_msgSender()].totalAwayPayout;
            } else {
                // revert
            }
        }
        token.safeTransferFrom(address(this), _to, amount);
        delete (wagerByAddress[_msgSender()]);

        // Uncomment the following line if you want to emit a Claimed event
        // emit Claimed(payout);
    }
}
