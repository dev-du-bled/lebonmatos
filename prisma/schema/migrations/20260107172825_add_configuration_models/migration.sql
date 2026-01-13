/*
  Warnings:

  - You are about to drop the column `profileImageId` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "images" DROP CONSTRAINT "images_postId_fkey";

-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_profileImageId_fkey";

-- DropIndex
DROP INDEX "user_profileImageId_key";

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "images" TEXT[];

-- AlterTable
ALTER TABLE "user" DROP COLUMN "profileImageId";

-- DropTable
DROP TABLE "images";

-- CreateTable
CREATE TABLE "configuration" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "userId" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuration_item" (
    "id" TEXT NOT NULL,
    "configurationId" TEXT NOT NULL,
    "componentType" "ComponentType" NOT NULL,
    "postId" TEXT,
    "quantity" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "configuration_item_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "configuration" ADD CONSTRAINT "configuration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_item" ADD CONSTRAINT "configuration_item_configurationId_fkey" FOREIGN KEY ("configurationId") REFERENCES "configuration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuration_item" ADD CONSTRAINT "configuration_item_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
