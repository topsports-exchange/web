import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  CollectPayout,
  Initialized,
  PlaceBet,
  ResolveEvent,
  ResolvedEvent
} from "../generated/Contract/Contract"

export function createCollectPayoutEvent(
  _amount: BigInt,
  _to: Address,
  _eventId: BigInt
): CollectPayout {
  let collectPayoutEvent = changetype<CollectPayout>(newMockEvent())

  collectPayoutEvent.parameters = new Array()

  collectPayoutEvent.parameters.push(
    new ethereum.EventParam(
      "_amount",
      ethereum.Value.fromUnsignedBigInt(_amount)
    )
  )
  collectPayoutEvent.parameters.push(
    new ethereum.EventParam("_to", ethereum.Value.fromAddress(_to))
  )
  collectPayoutEvent.parameters.push(
    new ethereum.EventParam(
      "_eventId",
      ethereum.Value.fromUnsignedBigInt(_eventId)
    )
  )

  return collectPayoutEvent
}

export function createInitializedEvent(version: BigInt): Initialized {
  let initializedEvent = changetype<Initialized>(newMockEvent())

  initializedEvent.parameters = new Array()

  initializedEvent.parameters.push(
    new ethereum.EventParam(
      "version",
      ethereum.Value.fromUnsignedBigInt(version)
    )
  )

  return initializedEvent
}

export function createPlaceBetEvent(): PlaceBet {
  let placeBetEvent = changetype<PlaceBet>(newMockEvent())

  placeBetEvent.parameters = new Array()

  return placeBetEvent
}

export function createResolveEventEvent(): ResolveEvent {
  let resolveEventEvent = changetype<ResolveEvent>(newMockEvent())

  resolveEventEvent.parameters = new Array()

  return resolveEventEvent
}

export function createResolvedEventEvent(param0: BigInt): ResolvedEvent {
  let resolvedEventEvent = changetype<ResolvedEvent>(newMockEvent())

  resolvedEventEvent.parameters = new Array()

  resolvedEventEvent.parameters.push(
    new ethereum.EventParam("param0", ethereum.Value.fromUnsignedBigInt(param0))
  )

  return resolvedEventEvent
}
