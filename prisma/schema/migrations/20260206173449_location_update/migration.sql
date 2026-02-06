/*
  Warnings:

  - You are about to drop the column `context` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `x` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `y` on the `location` table. All the data in the column will be lost.
  - Added the required column `city` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lat` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lon` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `location` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "location" DROP COLUMN "context",
DROP COLUMN "label",
DROP COLUMN "x",
DROP COLUMN "y",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "coordinates" DOUBLE PRECISION[],
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "displayName" TEXT NOT NULL,
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "lon" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
