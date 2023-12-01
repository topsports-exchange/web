/*
  Warnings:

  - Added the required column `maker` to the `MakerSignature` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MakerSignature" ADD COLUMN     "maker" TEXT NOT NULL;
