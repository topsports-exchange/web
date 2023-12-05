// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ITopsportsEventFactory {
    function registerBet(
        address _taker,
        uint64 _eventId,
        uint64 _startdate,
        uint256 _marketId,
        uint256 _betId
    ) external;

    function registerEvent(uint64 _eventId) external;
}
