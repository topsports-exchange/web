//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import {Multicall} from "@openzeppelin/contracts/utils/Multicall.sol";

import {GenericFactory} from "./utils/GenericFactory.sol";
import {TopsportsEventCore} from "./TopsportsEventCore.sol";

contract TopsportsEventFactory is GenericFactory, Multicall {
    constructor() GenericFactory(address(new TopsportsEventCore())) {}
}
