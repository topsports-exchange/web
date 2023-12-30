import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { CollectPayout } from "../generated/schema"
import { CollectPayout as CollectPayoutEvent } from "../generated/TopsportsEventCore/TopsportsEventCore"
import { handleCollectPayout } from "../src/topsports-event-core"
import { createCollectPayoutEvent } from "./topsports-event-core-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let _amount = BigInt.fromI32(234)
    let _to = Address.fromString("0x0000000000000000000000000000000000000001")
    let _eventId = BigInt.fromI32(234)
    let newCollectPayoutEvent = createCollectPayoutEvent(_amount, _to, _eventId)
    handleCollectPayout(newCollectPayoutEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CollectPayout created and stored", () => {
    assert.entityCount("CollectPayout", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CollectPayout",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_amount",
      "234"
    )
    assert.fieldEquals(
      "CollectPayout",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_to",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CollectPayout",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "_eventId",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
