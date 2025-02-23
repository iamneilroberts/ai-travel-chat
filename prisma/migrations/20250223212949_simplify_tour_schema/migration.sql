/*
  Warnings:

  - You are about to drop the column `images` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `itinerary` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `reviewsData` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `schedule` on the `Tour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "images",
DROP COLUMN "itinerary",
DROP COLUMN "reviewsData",
DROP COLUMN "schedule",
ALTER COLUMN "lastSync" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "ratingAvg" SET DEFAULT 0,
ALTER COLUMN "region" SET DEFAULT 'UNKNOWN',
ALTER COLUMN "reviewCount" SET DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
