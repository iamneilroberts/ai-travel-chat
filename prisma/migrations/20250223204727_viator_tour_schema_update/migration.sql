/*
  Warnings:

  - Added the required column `bookingInfo` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastSync` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productUrl` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ratingAvg` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewCount` to the `Tour` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "accessibility" TEXT[],
ADD COLUMN     "bookingInfo" JSONB NOT NULL,
ADD COLUMN     "exclusions" TEXT[],
ADD COLUMN     "highlights" TEXT[],
ADD COLUMN     "images" JSONB[],
ADD COLUMN     "inclusions" TEXT[],
ADD COLUMN     "itinerary" JSONB,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "lastSync" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "productUrl" TEXT NOT NULL,
ADD COLUMN     "ratingAvg" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "reviewCount" INTEGER NOT NULL,
ADD COLUMN     "reviewsData" JSONB,
ADD COLUMN     "status" TEXT NOT NULL,
ADD COLUMN     "tags" INTEGER[];
