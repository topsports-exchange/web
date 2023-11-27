/*
  Warnings:

  - Added the required column `salt` to the `DeployedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeployedEvent" ADD COLUMN     "salt" TEXT NOT NULL;
