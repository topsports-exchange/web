// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/dev/v1_0_0/libraries/FunctionsRequest.sol";
import {Context} from "@openzeppelin/contracts/utils/Context.sol";

import {ITopsportsEventCore as EventCore} from "./interfaces/ITopsportsEventCore.sol";

contract TopsportsFunctionsConsumer is FunctionsClient, ConfirmedOwner, Context {
    using FunctionsRequest for FunctionsRequest.Request;

    bytes32 public lastRequestId;
    bytes public lastResponse;
    bytes public lastError;

    error UnexpectedRequestID(bytes32 requestId);

    event Response(bytes32 indexed requestId, bytes response, bytes err);
    event EventContract(address indexed eventContract);

    mapping(bytes32 => address) public requestIdToEventContract;

    constructor(address router) FunctionsClient(router) ConfirmedOwner(_msgSender()) {}

    function sendRequest(
        string memory _source,
        string[] memory _args,
        uint64 _subscriptionId,
        uint32 _gasLimit,
        bytes32 _donID
    ) external returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(_source);
        if (_args.length > 0) req.setArgs(_args);
        lastRequestId = _sendRequest(req.encodeCBOR(), _subscriptionId, _gasLimit, _donID);

        //address eventContract = abi.decode(bytesArgs[0], (address));
        requestIdToEventContract[lastRequestId] = _msgSender();
        //emit EventContract(eventContract);

        return lastRequestId;
    }

    /**
     * @notice Store latest result/error
     * @param _requestId The request ID, returned by sendRequest()
     * @param _response Aggregated response from the user code
     * @param _err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 _requestId,
        bytes memory _response,
        bytes memory _err
    ) internal override {
        /*  if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        } */

        // useless. keeping for debug purpose
        lastResponse = _response;
        lastError = _err;

        EventCore eventContract = EventCore(requestIdToEventContract[_requestId]);
        eventContract.resolutionCallback(_requestId, _response, _err);

        emit Response(_requestId, lastResponse, lastError);
    }
}
