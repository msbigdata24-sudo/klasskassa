-- CreateEnum
CREATE TYPE "SettlementStatus" AS ENUM ('AWAITING_CREDITOR', 'CONFIRMED');

-- AlterTable
ALTER TABLE "Settlement" ADD COLUMN "status" "SettlementStatus" NOT NULL DEFAULT 'CONFIRMED';

-- CreateIndex
CREATE INDEX "Settlement_groupId_status_idx" ON "Settlement"("groupId", "status");
