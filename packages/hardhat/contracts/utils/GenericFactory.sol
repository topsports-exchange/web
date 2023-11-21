//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

abstract contract GenericFactory {
    using Clones for address;

    address public immutable IMPLEMENTATION;

    event CreateInstance(address indexed instance);

    constructor(address _implementation) {
        IMPLEMENTATION = _implementation;
    }

    function createInstance(bytes32 _salt, bytes calldata _data) external {
        address instance = IMPLEMENTATION.cloneDeterministic(_salt);
        // solhint-disable-next-line avoid-low-level-calls
        (bool success, bytes memory returndata) = instance.call(_data);
        if (!success) {
            // solhint-disable-next-line no-inline-assembly
            assembly {
                revert(add(returndata, 32), mload(returndata))
            }
        }
        emit CreateInstance(instance);
    }

    function predictAddress(bytes32 _salt) external view returns (address) {
        return IMPLEMENTATION.predictDeterministicAddress(_salt);
    }
}
