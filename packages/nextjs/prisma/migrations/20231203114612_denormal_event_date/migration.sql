/*
  Warnings:

  - Added the required column `eventDate` to the `MakerSignature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MakerSignature" ADD COLUMN     "eventDate" TIMESTAMP(3) NOT NULL;
