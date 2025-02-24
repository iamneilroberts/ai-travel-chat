-- AlterTable
ALTER TABLE "Tag" 
ADD COLUMN "category" TEXT NOT NULL DEFAULT 'other',
ADD COLUMN "description" TEXT,
ADD COLUMN "significance" TEXT;

-- Update existing records with default category
UPDATE "Tag" SET "category" = 'other' WHERE "category" IS NULL;

-- CreateIndex
CREATE INDEX "Tag_category_idx" ON "Tag"("category");
