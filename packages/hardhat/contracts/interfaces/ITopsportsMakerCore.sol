// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ITopsportsMakerCore {
    function permit(
        int64 _homeTeamOdds,
        int64 _awayTeamOdds,
        uint256 _limit,
        uint64 _deadline,
        bytes calldata _signature
    ) external;
}
