/*
  Warnings:

  - You are about to drop the column `locationId` on the `post` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId]` on the table `location` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `postId` to the `location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "post" DROP CONSTRAINT "post_locationId_fkey";

-- AlterTable
ALTER TABLE "location" ADD COLUMN     "postId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "post" DROP COLUMN "locationId";

-- CreateIndex
CREATE UNIQUE INDEX "location_postId_key" ON "location"("postId");

-- AddForeignKey
ALTER TABLE "location" ADD CONSTRAINT "location_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
