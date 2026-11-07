-- CreateTable
CREATE TABLE "Collection" (
    "id" SERIAL NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerImage" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_category_key" ON "Collection"("category");

-- CreateIndex
CREATE INDEX "Collection_active_idx" ON "Collection"("active");
