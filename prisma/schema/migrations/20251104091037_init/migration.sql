-- CreateEnum
CREATE TYPE "public"."REPORT_TYPE" AS ENUM ('SPAM', 'INNAPPROPRIATE', 'HARASSMENT', 'SCAM', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."REPORT_CONTENT" AS ENUM ('USER', 'POST', 'MESSAGE');

-- CreateTable
CREATE TABLE "public"."component" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "estimatedPrice" INTEGER,
    "color" VARCHAR(50),

    CONSTRAINT "component_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cpu" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "coreCount" SMALLINT NOT NULL,
    "coreClock" DECIMAL(6,2) NOT NULL,
    "boostClock" DECIMAL(6,2),
    "microarch" VARCHAR(20) NOT NULL,
    "tdp" SMALLINT NOT NULL,
    "graphics" VARCHAR(50),

    CONSTRAINT "cpu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gpu" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "chipset" VARCHAR(100) NOT NULL,
    "memory" SMALLINT NOT NULL,
    "coreClock" SMALLINT,
    "boostClock" SMALLINT,
    "length" SMALLINT,

    CONSTRAINT "gpu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."motherboard" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "socket" VARCHAR(50) NOT NULL,
    "formFactor" VARCHAR(25) NOT NULL,
    "maxMemory" SMALLINT NOT NULL,
    "memorySlots" SMALLINT NOT NULL,

    CONSTRAINT "motherboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ram" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "type" VARCHAR(10),
    "speed" SMALLINT,
    "modules" SMALLINT NOT NULL,
    "size" SMALLINT NOT NULL,
    "casLatency" SMALLINT NOT NULL,

    CONSTRAINT "ram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ssd" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "cache" INTEGER,
    "interface" VARCHAR(50) NOT NULL,
    "formFactor" VARCHAR(50) NOT NULL,

    CONSTRAINT "ssd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."hdd" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "cache" INTEGER,
    "formFactor" VARCHAR(50) NOT NULL,
    "interface" VARCHAR(50) NOT NULL,

    CONSTRAINT "hdd_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."powerSupply" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "wattage" SMALLINT NOT NULL,
    "efficiency" VARCHAR(50),
    "modular" VARCHAR(20),

    CONSTRAINT "powerSupply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cpuCooler" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "rpmIdle" SMALLINT,
    "rpmMax" SMALLINT,
    "noiseIdle" DECIMAL(6,1),
    "noiseMax" DECIMAL(6,1),
    "size" SMALLINT,

    CONSTRAINT "cpuCooler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."case" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "sidePanel" VARCHAR(50),
    "volume" DECIMAL(6,2),
    "bays3_5" SMALLINT NOT NULL,

    CONSTRAINT "case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."caseFan" (
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

    CONSTRAINT "caseFan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."soundCard" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "channels" SMALLINT NOT NULL,
    "digitalAudio" SMALLINT,
    "snr" SMALLINT,
    "sampleRate" SMALLINT,
    "chipset" VARCHAR(75),
    "interface" VARCHAR(20) NOT NULL,

    CONSTRAINT "soundCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."networkCard" (
    "id" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "interface" VARCHAR(50) NOT NULL,
    "protocol" VARCHAR(100) NOT NULL,

    CONSTRAINT "networkCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."post" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "componentId" TEXT NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."report" (
    "id" TEXT NOT NULL,
    "reason" "public"."REPORT_TYPE" NOT NULL,
    "details" TEXT,
    "type" "public"."REPORT_CONTENT" NOT NULL,
    "postId" TEXT,
    "userId" TEXT,
    "messageId" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."discussion" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "sellerId" TEXT,

    CONSTRAINT "discussion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."message" (
    "id" TEXT NOT NULL,
    "discussionId" TEXT NOT NULL,
    "price" SMALLINT,
    "content" TEXT,
    "authorID" TEXT NOT NULL,
    "sendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "viewed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cpu_componentId_key" ON "public"."cpu"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "gpu_componentId_key" ON "public"."gpu"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "motherboard_componentId_key" ON "public"."motherboard"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ram_componentId_key" ON "public"."ram"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "ssd_componentId_key" ON "public"."ssd"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "hdd_componentId_key" ON "public"."hdd"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "powerSupply_componentId_key" ON "public"."powerSupply"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "cpuCooler_componentId_key" ON "public"."cpuCooler"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "case_componentId_key" ON "public"."case"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "caseFan_componentId_key" ON "public"."caseFan"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "soundCard_componentId_key" ON "public"."soundCard"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "networkCard_componentId_key" ON "public"."networkCard"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "public"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "public"."session"("token");

-- AddForeignKey
ALTER TABLE "public"."cpu" ADD CONSTRAINT "cpu_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gpu" ADD CONSTRAINT "gpu_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."motherboard" ADD CONSTRAINT "motherboard_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ram" ADD CONSTRAINT "ram_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ssd" ADD CONSTRAINT "ssd_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."hdd" ADD CONSTRAINT "hdd_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."powerSupply" ADD CONSTRAINT "powerSupply_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cpuCooler" ADD CONSTRAINT "cpuCooler_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."case" ADD CONSTRAINT "case_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caseFan" ADD CONSTRAINT "caseFan_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."soundCard" ADD CONSTRAINT "soundCard_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."networkCard" ADD CONSTRAINT "networkCard_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."post" ADD CONSTRAINT "post_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "public"."component"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite" ADD CONSTRAINT "favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorite" ADD CONSTRAINT "favorite_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report" ADD CONSTRAINT "report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."report" ADD CONSTRAINT "report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussion" ADD CONSTRAINT "discussion_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussion" ADD CONSTRAINT "discussion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."discussion" ADD CONSTRAINT "discussion_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_discussionId_fkey" FOREIGN KEY ("discussionId") REFERENCES "public"."discussion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."message" ADD CONSTRAINT "message_authorID_fkey" FOREIGN KEY ("authorID") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
