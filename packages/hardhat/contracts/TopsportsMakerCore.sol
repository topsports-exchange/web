// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {NoncesUpgradeable as Nonces} from "@openzeppelin/contracts-upgradeable/utils/NoncesUpgradeable.sol";
import {EIP712Upgradeable as EIP712} from "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";
import {OwnableUpgradeable as Ownable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

import {ITopsportsEventCore as EventCore} from "./interfaces/ITopsportsEventCore.sol";

/// @title TopsportsMakerCore
/// @author The topsports.exchange devs
/// @notice makerCore is a provisionning contract owned by a market maker. they can deposit and withdraw funds from this contract.
/// funds are pulled from the the maker's provisionning contract when a user takes a bet on a market of the market maker.
/// additionally stakes won by the market maker are collected  to this contract

contract TopsportsMakerCore is Initializable, EIP712, Nonces, Ownable {
    using SafeERC20 for IERC20;

    error ExpiredSignature(uint256 deadline);
    error InvalidSigner(address signer, address owner);

    error UnknownError();
    error AlreadyClaimed();

    // EIP-712 typed structured data signature
    bytes32 private constant PERMIT_TYPEHASH =
        keccak256(
            "Permit(address spender,int64 homeTeamOdds,int64 awayTeamOdds,uint256 limit,uint256 nonce,uint64 deadline)"
        );

    // Immutable variables
    IERC20 public token; // stake/wager token

    constructor() {
        _disableInitializers();
    }

    /**
     * @notice Function to initialize the TopsportsMakerCore contract after it has been deployed on-chain.
     *
     * @dev The initialize function sets the initial parameters for the TopsportsMakerCore contract,
     * including EIP-712 initialization, nonce initialization, and setting the contract owner. It also
     * initializes the ERC20 token used for staking and wagering.
     *
     * @param _token The address of the ERC20 token used for staking and wagering.
     * @param _owner The address of the owner of the TopsportsMakerCore contract.
     */
    function initialize(address _token, address _owner) external initializer {
        // Initialize EIP-712 with domain and version
        __EIP712_init("topsports.exchange", "1");

        // Initialize Nonces for preventing replay attacks and revoking signatures
        __Nonces_init();

        // Initialize Ownable contract with the specified owner
        __Ownable_init(_owner);

        // Set the ERC20 token for staking and wagering
        token = IERC20(_token);
    }

    function hashMarket(
        address _spender,
        int64 _homeTeamOdds,
        int64 _awayTeamOdds,
        uint256 _limit,
        uint256 _nonce,
        uint64 _deadline
    ) private pure returns (bytes32) {
        return
            keccak256(
                abi.encode(
                    PERMIT_TYPEHASH,
                    _spender,
                    _homeTeamOdds,
                    _awayTeamOdds,
                    _limit,
                    _nonce,
                    _deadline
                )
            );
    }

    /**
     * @notice Function to set approval for a market maker to enable users to take bets on a market.
     *
     * @dev The permit function allows the market maker to specify approval parameters, including home team odds,
     * away team odds, wager limit, deadline, and a typed structured data signature. The approval ensures that users
     * can place bets within the agreed-upon terms. If the signature is valid and has not expired, the function grants
     * approval to the market maker to the specified limit.
     *
     * @param _homeTeamOdds Home team odds as agreed by the market maker, in American odds notation.
     * @param _awayTeamOdds Away team odds as agreed by the market maker, in American odds notation.
     * @param _limit The amount of assets that the market maker is willing to wager against the market taker.
     * @param _deadline The date after which the signature becomes invalid and cannot be used to take new bets.
     * @param _signature Signature of typed structured data describing the bet as agreed by the market maker.
     */
    function permit(
        int64 _homeTeamOdds,
        int64 _awayTeamOdds,
        uint256 _limit,
        uint64 _deadline,
        bytes calldata _signature
    ) external {
        if (block.timestamp > _deadline) revert ExpiredSignature(_deadline);
        address spender = _msgSender();
        bytes32 digest = _hashTypedDataV4(
            hashMarket(spender, _homeTeamOdds, _awayTeamOdds, _limit, _useNonce(spender), _deadline)
        );
        address signer = ECDSA.recover(digest, _signature);
        if (signer != owner()) revert InvalidSigner(signer, owner());
        token.forceApprove(spender, _limit);
    }

    /**
     * @notice Function to withdraw any ERC20 token in this provisionning contract. Tokens can be removed
     * anytime by the owner of the provisionning contract. If the market maker has created a market
     * and a user wants to take that market, and the market maker has withdrawn more than the potential profit
     * to the taker for that market, then the taker won't be able to place their bet.
     *
     * @dev The withdraw function allows the owner to withdraw a specified amount of a given ERC20 token to a designated address.
     *
     * @param _token The ERC20 wager token.
     * @param _to The address where the owner of the contract wants to withdraw their tokens; tokens can be withdrawn to a different address.
     * @param _amount The amount of tokens to withdraw.
     */
    function withdraw(address _token, address _to, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(_to, _amount);
    }

    /**
     * @notice When the owner calls this function, it prevents any user from taking the currently enabled market
     * created by the market maker.
     *
     * @dev A market maker can only have one market available to market takers on an event.
     *
     * @param _spender The address of the contract for the event.
     */
    function revokeSignature(address _spender) external onlyOwner {
        _useNonce(_spender);
        token.forceApprove(_spender, 0);
    }

    /**
     * @notice If the sender is the winner, this function allows them to collect the payout for a bet on a market of a
     * given event. The payout can be transferred to a different address than the message sender.
     *
     * @param _eventAddr The address of the event contract.
     * @param _marketId The ID of the market where the bet has been placed.
     * @param _betId The ID of the bet within the list of bets placed in that market.
     * @param _to The address of the receiver of the payout.
     * @return payout The total amount of the payout, including the original stake and any profit.
     */
    function collectOne(
        address _eventAddr,
        uint256 _marketId,
        uint256 _betId,
        address _to
    ) external onlyOwner returns (uint256 payout) {
        EventCore eventCore = EventCore(_eventAddr);
        payout = eventCore.collectOne(_marketId, _betId, _to);
    }

    //TODO: add collectAll() helper function
}
