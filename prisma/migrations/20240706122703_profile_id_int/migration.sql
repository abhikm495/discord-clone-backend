/*
  Warnings:

  - Changed the type of `profileId` on the `Member` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_profileId_fkey";

-- AlterTable
ALTER TABLE "Member" DROP COLUMN "profileId",
ADD COLUMN     "profileId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Member_profileId_idx" ON "Member"("profileId");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
