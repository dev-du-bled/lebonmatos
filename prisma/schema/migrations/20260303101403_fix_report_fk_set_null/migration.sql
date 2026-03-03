-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_postId_fkey";

-- DropForeignKey
ALTER TABLE "report" DROP CONSTRAINT "report_ratingId_fkey";

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "rating"("id") ON DELETE SET NULL ON UPDATE CASCADE;
