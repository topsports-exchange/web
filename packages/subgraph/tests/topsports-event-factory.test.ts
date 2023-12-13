import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address } from "@graphprotocol/graph-ts"
import { CreateInstance } from "../generated/schema"
import { CreateInstance as CreateInstanceEvent } from "../generated/TopsportsEventFactory/TopsportsEventFactory"
import { handleCreateInstance } from "../src/topsports-event-factory"
import { createCreateInstanceEvent } from "./topsports-event-factory-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let instance = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newCreateInstanceEvent = createCreateInstanceEvent(instance)
    handleCreateInstance(newCreateInstanceEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CreateInstance created and stored", () => {
    assert.entityCount("CreateInstance", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CreateInstance",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "instance",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
