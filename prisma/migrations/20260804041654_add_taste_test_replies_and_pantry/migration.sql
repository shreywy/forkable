-- CreateTable
CREATE TABLE "TasteTestReply" (
    "id" TEXT NOT NULL,
    "tasteTestId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TasteTestReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PantryItem" (
    "userId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PantryItem_pkey" PRIMARY KEY ("userId","ingredientId")
);

-- CreateIndex
CREATE INDEX "TasteTestReply_tasteTestId_createdAt_idx" ON "TasteTestReply"("tasteTestId", "createdAt");

-- CreateIndex
CREATE INDEX "TasteTestReply_authorId_idx" ON "TasteTestReply"("authorId");

-- CreateIndex
CREATE INDEX "PantryItem_userId_idx" ON "PantryItem"("userId");

-- CreateIndex
CREATE INDEX "PantryItem_ingredientId_idx" ON "PantryItem"("ingredientId");

-- AddForeignKey
ALTER TABLE "TasteTestReply" ADD CONSTRAINT "TasteTestReply_tasteTestId_fkey" FOREIGN KEY ("tasteTestId") REFERENCES "TasteTest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TasteTestReply" ADD CONSTRAINT "TasteTestReply_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PantryItem" ADD CONSTRAINT "PantryItem_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
