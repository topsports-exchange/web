// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ITopsportsMakerCore {
    function permit(
        int256 _homeTeamOdds,
        int256 _awayTeamOdds,
        uint256 _limit,
        uint256 _deadline,
        bytes calldata _signature
    ) external;
}
