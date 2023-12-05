// SPDX-License-Identifier: Unlicense

// Solidity version 0.8.20 or higher is required.
pragma solidity ^0.8.20;

// Import necessary libraries and contracts.
import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

// Import custom utility contracts.
import {GenericFactory} from "./utils/GenericFactory.sol";
import {TopsportsEventCore} from "./TopsportsEventCore.sol";

// Contract definition for the TopsportsEventFactory.
contract TopsportsEventFactory is Context, GenericFactory, Multicall {
    // Define a custom error for unauthorized events.
    error UnauthorizedEvent();

    // Modifier to restrict certain functions to be callable only from registered events.
    modifier onlyFromEvent() {
        if (!isRegisteredEvent[_msgSender()]) revert UnauthorizedEvent();
        _;
    }

    // Mapping to track whether an event is registered.
    mapping(address => bool) public isRegisteredEvent;

    // Mapping to store betting information for each user.
    mapping(address => BetInfo[]) public betsByAddress;

    // Mapping to get event contract from an event id.
    mapping(uint64 => address) public eventContractByEventId;

    // List of all event contracts.
    address[] public eventContracts;

    // Structure to represent information about a bet.
    struct BetInfo {
        uint64 eventId; // Id of the event in the external sports data API.
        address eventContract; // Address of the event contract.
        uint64 startdate; // Scheduled date of the event; funds are unlocked 24 hours later if the event is not resolved by an oracle.
        uint256 marketId; // Index of the market in the array of markets for that event.
        uint256 betId; // Index of the bet in the array of bets of the corresponding market.
    }

    // Constructor function to initialize the TopsportsEventFactory.
    constructor() GenericFactory(address(new TopsportsEventCore())) {
        // solhint-disable-previous-line no-empty-blocks
        // The constructor initializes the GenericFactory with the address of a new TopsportsEventCore contract.
    }

    // Function to create a minimal clone contract of an implementation contract.
    function createInstance(
        bytes32 _salt, // Salt value for creating a unique clone contract.
        bytes calldata _data // Initialization data for the clone contract.
    ) public override returns (address instance) {
        instance = super.predictAddress(_salt);
        isRegisteredEvent[instance] = true; // Mark the newly created contract as a registered event.
        eventContracts.push(instance);

        // Register the event prior to invoking createInstance since the `initialize` function
        // within the event will subsequently invoke the `registerEvent` function.
        super.createInstance(_salt, _data);
    }

    // Function to register a bet placed on a previously created event.
    // This is used to support showing all bets for a user in the front-end.
    function registerBet(
        address _taker, // Address of the wallet taking the market.
        uint64 _eventId, // Id of the event in the external sports data API.
        uint64 _startdate, // Scheduled date of the event.
        uint256 _marketId, // Index of the market in the array of markets for that event.
        uint256 _betId // Index of the bet in the array of bets for the corresponding market.
    ) external onlyFromEvent {
        BetInfo memory betInfo = BetInfo(_eventId, _msgSender(), _startdate, _marketId, _betId);
        betsByAddress[_taker].push(betInfo); // Add the bet information to the user's betting history.
    }

    // Registers an event by associating the provided `_eventId` with the address of the
    // calling contract. This function is restricted to be called only by registered event
    // contracts using the `onlyFromEvent` modifier.
    function registerEvent(uint64 _eventId) external onlyFromEvent {
        eventContractByEventId[_eventId] = _msgSender();
    }

    // Return array of all existing event contracts.
    function getEventContracts() external view returns (address[] memory) {
        return eventContracts;
    }
}
