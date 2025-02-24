-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "rawTagIds" INTEGER[];

-- CreateTable
CREATE TABLE "Tag" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "parentIds" INTEGER[],
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TourTag" (
    "tourId" TEXT NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "TourTag_pkey" PRIMARY KEY ("tourId","tagId")
);

-- CreateIndex
CREATE INDEX "Tag_id_idx" ON "Tag"("id");

-- CreateIndex
CREATE INDEX "TourTag_tourId_idx" ON "TourTag"("tourId");

-- CreateIndex
CREATE INDEX "TourTag_tagId_idx" ON "TourTag"("tagId");

-- AddForeignKey
ALTER TABLE "TourTag" ADD CONSTRAINT "TourTag_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourTag" ADD CONSTRAINT "TourTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
