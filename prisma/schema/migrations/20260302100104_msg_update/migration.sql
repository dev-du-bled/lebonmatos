/*
  Warnings:

  - A unique constraint covering the columns `[postId,buyerId]` on the table `discussion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'OFFER', 'SYSTEM');

-- AlterTable
ALTER TABLE "discussion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "message" ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT',
ALTER COLUMN "authorID" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "discussion_postId_buyerId_key" ON "discussion"("postId", "buyerId");
