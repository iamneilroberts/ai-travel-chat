-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "tourId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" JSONB NOT NULL,
    "ratings" DOUBLE PRECISION NOT NULL,
    "reviews" INTEGER NOT NULL,
    "categories" TEXT[],
    "duration" TEXT NOT NULL,
    "priceRange" JSONB NOT NULL,
    "schedule" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tour_tourId_key" ON "Tour"("tourId");
