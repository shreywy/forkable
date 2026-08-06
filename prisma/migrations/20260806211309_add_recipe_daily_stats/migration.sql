-- CreateTable
CREATE TABLE "RecipeDailyStat" (
    "recipeId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RecipeDailyStat_pkey" PRIMARY KEY ("recipeId","day")
);

-- CreateIndex
CREATE INDEX "RecipeDailyStat_recipeId_day_idx" ON "RecipeDailyStat"("recipeId", "day");

-- AddForeignKey
ALTER TABLE "RecipeDailyStat" ADD CONSTRAINT "RecipeDailyStat_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;
