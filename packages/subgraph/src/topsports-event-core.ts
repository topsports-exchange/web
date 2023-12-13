import {
  CollectPayout as CollectPayoutEvent,
  Initialized as InitializedEvent,
  PlaceBet as PlaceBetEvent,
  ResolveEvent as ResolveEventEvent,
  ResolvedEvent as ResolvedEventEvent
} from "../generated/TopsportsEventCore/TopsportsEventCore"
import {
  CollectPayout,
  Initialized,
  PlaceBet,
  ResolveEvent,
  ResolvedEvent
} from "../generated/schema"

export function handleCollectPayout(event: CollectPayoutEvent): void {
  let entity = new CollectPayout(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity._amount = event.params._amount
  entity._to = event.params._to
  entity._eventId = event.params._eventId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleInitialized(event: InitializedEvent): void {
  let entity = new Initialized(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.version = event.params.version

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handlePlaceBet(event: PlaceBetEvent): void {
  let entity = new PlaceBet(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleResolveEvent(event: ResolveEventEvent): void {
  let entity = new ResolveEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleResolvedEvent(event: ResolvedEventEvent): void {
  let entity = new ResolvedEvent(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.param0 = event.params.param0

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
