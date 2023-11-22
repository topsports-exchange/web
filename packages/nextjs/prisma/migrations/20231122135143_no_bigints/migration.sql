/*
  Warnings:

  - You are about to alter the column `homeTeamOddsNormalized` on the `MakerSignature` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `awayTeamOddsNormalized` on the `MakerSignature` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `limitNormalized` on the `MakerSignature` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "MakerSignature" ALTER COLUMN "homeTeamOddsNormalized" SET DATA TYPE INTEGER,
ALTER COLUMN "awayTeamOddsNormalized" SET DATA TYPE INTEGER,
ALTER COLUMN "limitNormalized" SET DATA TYPE INTEGER;
