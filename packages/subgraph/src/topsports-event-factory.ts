import { TopsportsEventCore } from "../generated/templates";
import { CreateInstance as CreateInstanceEvent } from "../generated/TopsportsEventFactory/TopsportsEventFactory";
import { CreateInstance } from "../generated/schema";

export function handleCreateInstance(event: CreateInstanceEvent): void {
    let entity = new CreateInstance(event.transaction.hash.concatI32(event.logIndex.toI32()));
    entity.instance = event.params.instance;

    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;

    entity.save();

    // Start indexing the instance; `event.params.instance` is the
    // address of the new instance contract
    TopsportsEventCore.create(event.params.instance);
}
