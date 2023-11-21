//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.20;

import {GenericFactory} from "./utils/GenericFactory.sol";
import {TopsportsMakerCore} from "./TopsportsMakerCore.sol";

contract TopsportsMakerFactory is GenericFactory {
    constructor() GenericFactory(address(new TopsportsMakerCore())) {}
}
