-- AlterTable
ALTER TABLE "post" ADD COLUMN "isSold" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "post" ADD COLUMN "boughtById" TEXT;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_boughtById_fkey" FOREIGN KEY ("boughtById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;