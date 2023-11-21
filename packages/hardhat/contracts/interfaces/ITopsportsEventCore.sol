// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ITopsportsEventCore {
    function resolutionCallback(
        bytes32 _requestId,
        bytes memory _response,
        bytes memory _err
    ) external;

    function collectOne(
        uint256 _marketId,
        uint256 _betId,
        address _to
    ) external returns (uint256 payout);
}
