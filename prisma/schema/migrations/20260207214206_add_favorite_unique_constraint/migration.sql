/*
  Warnings:

  - A unique constraint covering the columns `[postId,userId]` on the table `favorite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "favorite_postId_userId_key" ON "favorite"("postId", "userId");
