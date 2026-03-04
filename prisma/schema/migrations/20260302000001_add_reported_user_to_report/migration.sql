-- AlterTable
ALTER TABLE "report" ADD COLUMN     "reportedUserId" TEXT;

-- AddForeignKey
ALTER TABLE "report" ADD CONSTRAINT "report_reportedUserId_fkey" FOREIGN KEY ("reportedUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
