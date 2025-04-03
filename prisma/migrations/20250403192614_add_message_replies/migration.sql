/*
  Warnings:

  - You are about to drop the column `isOnline` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "replyToId" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isOnline";

-- CreateIndex
CREATE INDEX "Message_replyToId_idx" ON "Message"("replyToId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
