import { newMockEvent } from "matchstick-as"
import { ethereum, Address } from "@graphprotocol/graph-ts"
import { CreateInstance } from "../generated/TopsportsEventFactory/TopsportsEventFactory"

export function createCreateInstanceEvent(instance: Address): CreateInstance {
  let createInstanceEvent = changetype<CreateInstance>(newMockEvent())

  createInstanceEvent.parameters = new Array()

  createInstanceEvent.parameters.push(
    new ethereum.EventParam("instance", ethereum.Value.fromAddress(instance))
  )

  return createInstanceEvent
}
