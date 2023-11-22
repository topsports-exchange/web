-- CreateTable
CREATE TABLE "MakerSignature" (
    "id" SERIAL NOT NULL,
    "spender" TEXT NOT NULL,
    "homeTeamOdds" BYTEA NOT NULL,
    "awayTeamOdds" BYTEA NOT NULL,
    "limit" BYTEA NOT NULL,
    "nonce" BYTEA NOT NULL,
    "deadline" BYTEA NOT NULL,
    "signature" BYTEA NOT NULL,
    "homeTeamOddsNormalized" BIGINT NOT NULL,
    "awayTeamOddsNormalized" BIGINT NOT NULL,
    "limitNormalized" BIGINT NOT NULL,
    "deadlineNormalized" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MakerSignature_pkey" PRIMARY KEY ("id")
);
