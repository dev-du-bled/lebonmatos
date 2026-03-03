-- AlterTable
ALTER TABLE "message" ADD COLUMN     "buttonAction" TEXT,
ADD COLUMN     "buttonLabel" TEXT,
ADD COLUMN     "buttonUrl" TEXT,
ADD COLUMN     "imageUrls" TEXT[];
