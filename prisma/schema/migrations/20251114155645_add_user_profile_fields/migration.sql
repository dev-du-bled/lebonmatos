/*
  Warnings:

  - You are about to drop the `networkCard` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[profileImageId]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `user` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `component` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ComponentType" AS ENUM ('CPU', 'GPU', 'MOTHERBOARD', 'RAM', 'SSD', 'HDD', 'POWER_SUPPLY', 'CPU_COOLER', 'CASE', 'CASE_FAN', 'SOUND_CARD', 'WIRELESS_NETWORK_CARD');

-- DropForeignKey
ALTER TABLE "public"."networkCard" DROP CONSTRAINT "networkCard_componentId_fkey";

-- AlterTable
ALTER TABLE "component" ADD COLUMN     "type" "ComponentType" NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "displayUsername" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "profileImageId" TEXT,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "website" TEXT;

-- DropTable
DROP TABLE "public"."networkCard";

-- CreateTable
CREATE TABLE "wirelessNetworkCard" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "interface" VARCHAR(50) NOT NULL,
    "protocol" VARCHAR(100) NOT NULL,

    CONSTRAINT "wirelessNetworkCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "alt" TEXT,
    "postId" TEXT,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wirelessNetworkCard_componentId_key" ON "wirelessNetworkCard"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profileImageId_key" ON "user"("profileImageId");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- AddForeignKey
ALTER TABLE "wirelessNetworkCard" ADD CONSTRAINT "wirelessNetworkCard_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_profileImageId_fkey" FOREIGN KEY ("profileImageId") REFERENCES "images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
