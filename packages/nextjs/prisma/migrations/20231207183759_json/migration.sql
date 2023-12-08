/*
  Warnings:

  - Added the required column `awayTeam` to the `DeployedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTeam` to the `DeployedEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `venue` to the `DeployedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeployedEvent" ADD COLUMN     "awayTeam" JSONB NOT NULL,
ADD COLUMN     "homeTeam" JSONB NOT NULL,
ADD COLUMN     "venue" JSONB NOT NULL;
