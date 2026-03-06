-- DropForeignKey
ALTER TABLE "Discussion" DROP CONSTRAINT "discussion_postId_fkey";

-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "rating_postId_fkey";

-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "postId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Discussion" ADD CONSTRAINT "discussion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "rating_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
