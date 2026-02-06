/*
  Warnings:

  - You are about to drop the column `location` on the `post` table. All the data in the column will be lost.
  - You are about to drop the `caseFan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cpuCooler` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `powerSupply` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `soundCard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `wirelessNetworkCard` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `locationId` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "caseFan" DROP CONSTRAINT "caseFan_componentId_fkey";

-- DropForeignKey
ALTER TABLE "cpuCooler" DROP CONSTRAINT "cpuCooler_componentId_fkey";

-- DropForeignKey
ALTER TABLE "powerSupply" DROP CONSTRAINT "powerSupply_componentId_fkey";

-- DropForeignKey
ALTER TABLE "soundCard" DROP CONSTRAINT "soundCard_componentId_fkey";

-- DropForeignKey
ALTER TABLE "wirelessNetworkCard" DROP CONSTRAINT "wirelessNetworkCard_componentId_fkey";

-- AlterTable
ALTER TABLE "post" DROP COLUMN "location",
ADD COLUMN     "locationId" TEXT NOT NULL;

-- DropTable
DROP TABLE "caseFan";

-- DropTable
DROP TABLE "cpuCooler";

-- DropTable
DROP TABLE "powerSupply";

-- DropTable
DROP TABLE "soundCard";

-- DropTable
DROP TABLE "wirelessNetworkCard";

-- CreateTable
CREATE TABLE "power_supply" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "wattage" SMALLINT NOT NULL,
    "efficiency" VARCHAR(50),
    "modular" VARCHAR(20),

    CONSTRAINT "power_supply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cpu_cooler" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "rpmIdle" SMALLINT,
    "rpmMax" SMALLINT,
    "noiseIdle" DECIMAL(6,1),
    "noiseMax" DECIMAL(6,1),
    "size" SMALLINT,

    CONSTRAINT "cpu_cooler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "case_fan" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "size" SMALLINT NOT NULL,
    "rpmIdle" SMALLINT,
    "rpmMax" SMALLINT,
    "noiseIdle" DECIMAL(6,1),
    "noiseMax" DECIMAL(6,1),
    "airflowIdle" DECIMAL(6,1),
    "airflowMax" DECIMAL(6,1),
    "pwm" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "case_fan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sound_card" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "channels" SMALLINT NOT NULL,
    "digitalAudio" SMALLINT,
    "snr" SMALLINT,
    "sampleRate" SMALLINT,
    "chipset" VARCHAR(75),
    "interface" VARCHAR(20) NOT NULL,

    CONSTRAINT "sound_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wireless_network_card" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "interface" VARCHAR(50) NOT NULL,
    "protocol" VARCHAR(100) NOT NULL,

    CONSTRAINT "wireless_network_card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "context" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "location_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "power_supply_componentId_key" ON "power_supply"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "cpu_cooler_componentId_key" ON "cpu_cooler"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "case_fan_componentId_key" ON "case_fan"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "sound_card_componentId_key" ON "sound_card"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "wireless_network_card_componentId_key" ON "wireless_network_card"("componentId");

-- AddForeignKey
ALTER TABLE "power_supply" ADD CONSTRAINT "power_supply_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cpu_cooler" ADD CONSTRAINT "cpu_cooler_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "case_fan" ADD CONSTRAINT "case_fan_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sound_card" ADD CONSTRAINT "sound_card_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wireless_network_card" ADD CONSTRAINT "wireless_network_card_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
