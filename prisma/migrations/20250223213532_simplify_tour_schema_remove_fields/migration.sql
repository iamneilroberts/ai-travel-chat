/*
  Warnings:

  - You are about to drop the column `accessibility` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `bookingInfo` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `exclusions` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `highlights` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `inclusions` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `languages` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `productUrl` on the `Tour` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Tour` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tour" DROP COLUMN "accessibility",
DROP COLUMN "bookingInfo",
DROP COLUMN "exclusions",
DROP COLUMN "highlights",
DROP COLUMN "inclusions",
DROP COLUMN "languages",
DROP COLUMN "productUrl",
DROP COLUMN "tags";
