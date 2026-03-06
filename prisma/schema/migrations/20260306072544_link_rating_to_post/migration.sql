/*
  Warnings:

  - A unique constraint covering the columns `[postId,raterId]` on the table `rating` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postId` to the `rating` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "rating_userId_raterId_key";

-- AlterTable
ALTER TABLE "rating" ADD COLUMN     "postId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "rating_postId_raterId_key" ON "rating"("postId", "raterId");

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
