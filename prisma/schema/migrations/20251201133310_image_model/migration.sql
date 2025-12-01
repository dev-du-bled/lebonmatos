/*
  Warnings:

  - You are about to drop the column `bio` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `user` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "images" ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "bio",
DROP COLUMN "image",
DROP COLUMN "location",
DROP COLUMN "website";

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
