/*
  Warnings:

  - You are about to drop the column `date` on the `DeployedEvent` table. All the data in the column will be lost.
  - Added the required column `eventDate` to the `DeployedEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DeployedEvent" DROP COLUMN "date",
ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL;
