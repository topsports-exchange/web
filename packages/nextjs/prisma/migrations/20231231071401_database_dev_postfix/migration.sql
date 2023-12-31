-- CreateTable
CREATE TABLE "MakerSignature_tomo" (
    "id" SERIAL NOT NULL,
    "maker" TEXT NOT NULL,
    "spender" TEXT NOT NULL,
    "homeTeamOdds" TEXT NOT NULL,
    "awayTeamOdds" TEXT NOT NULL,
    "limit" TEXT NOT NULL,
    "nonce" TEXT NOT NULL,
    "deadline" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "homeTeamOddsNormalized" INTEGER NOT NULL,
    "awayTeamOddsNormalized" INTEGER NOT NULL,
    "limitNormalized" INTEGER NOT NULL,
    "deadlineNormalized" TIMESTAMP(3) NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MakerSignature_tomo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeployedEvent_tomo" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "eventDate" TIMESTAMP(3) NOT NULL,
    "startdate" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "venue" JSONB NOT NULL,
    "homeTeam" JSONB NOT NULL,
    "awayTeam" JSONB NOT NULL,

    CONSTRAINT "DeployedEvent_tomo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeployedEvent_tomo_eventId_key" ON "DeployedEvent_tomo"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "DeployedEvent_tomo_address_key" ON "DeployedEvent_tomo"("address");

-- CreateIndex
CREATE UNIQUE INDEX "DeployedEvent_tomo_salt_key" ON "DeployedEvent_tomo"("salt");
