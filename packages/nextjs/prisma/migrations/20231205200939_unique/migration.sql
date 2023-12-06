/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `DeployedEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[address]` on the table `DeployedEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[salt]` on the table `DeployedEvent` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeployedEvent_eventId_key" ON "DeployedEvent"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "DeployedEvent_address_key" ON "DeployedEvent"("address");

-- CreateIndex
CREATE UNIQUE INDEX "DeployedEvent_salt_key" ON "DeployedEvent"("salt");
