// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

interface ITopsportsFunctionsConsumer {
    function sendRequest(
        string memory _source,
        string[] memory _args,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        bytes32 _donID
    ) external returns (bytes32 requestId);
}
