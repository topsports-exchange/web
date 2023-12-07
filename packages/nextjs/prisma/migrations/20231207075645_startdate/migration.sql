/*
  Warnings:

  - You are about to drop the column `deadline` on the `DeployedEvent` table. All the data in the column will be lost.
  - Added the required column `startdate` to the `DeployedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeployedEvent" DROP COLUMN "deadline",
ADD COLUMN     "startdate" TIMESTAMP(3) NOT NULL;
