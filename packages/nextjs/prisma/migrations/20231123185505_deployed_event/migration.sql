-- CreateTable
CREATE TABLE "DeployedEvent" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "DeployedEvent_pkey" PRIMARY KEY ("id")
);
