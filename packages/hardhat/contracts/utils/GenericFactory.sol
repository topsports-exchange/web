// SPDX-License-Identifier: Unlicense

// Solidity version 0.8.20 or higher is required.
pragma solidity ^0.8.20;

// Import necessary library for creating minimal clones.
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

// Abstract contract for an EIP-1167 minimal clone factory.
abstract contract GenericFactory {
    using Clones for address;

    // Address of the implementation contract for creating clones.
    address public immutable IMPLEMENTATION;

    // Event emitted when a new instance (clone) is created.
    event CreateInstance(address indexed instance);

    // Constructor to initialize the implementation address.
    constructor(address _implementation) {
        require(_implementation != address(0), "Invalid implementation address");
        IMPLEMENTATION = _implementation;
    }

    /**
     * @notice Creates a new instance (clone) of the implementation contract.
     * @dev The instance is created using a deterministic address based on a provided salt.
     * @param _salt Salt value for creating a unique clone contract.
     * @param _data Initialization data for the clone contract.
     * @return instance The address of the newly created instance.
     */
    function createInstance(
        bytes32 _salt,
        bytes calldata _data
    ) public virtual returns (address instance) {
        // Ensure that the salt is not zero to prevent address collisions.
        require(_salt != bytes32(0), "Invalid salt value");

        // Create a clone with a deterministic address based on the implementation and salt.
        instance = IMPLEMENTATION.cloneDeterministic(_salt);

        // Execute a low-level call to initialize the clone with the provided data.
        (bool success, bytes memory returndata) = instance.call(_data);
        if (!success) {
            // If the initialization call fails, revert with the error message from the call.
            // solhint-disable-next-line no-inline-assembly
            assembly {
                revert(add(returndata, 32), mload(returndata))
            }
        }

        // Emit an event indicating the creation of a new instance.
        emit CreateInstance(instance);
    }

    /**
     * @notice Predicts the address of a clone without actually creating it.
     * @dev Returns the deterministic address based on the implementation and salt.
     * @param _salt Salt value used to predict the address.
     * @return predictedAddress The predicted address of the clone.
     */
    function predictAddress(bytes32 _salt) public view virtual returns (address predictedAddress) {
        // Return the deterministic address based on the implementation and salt.
        predictedAddress = IMPLEMENTATION.predictDeterministicAddress(_salt);
    }
}
