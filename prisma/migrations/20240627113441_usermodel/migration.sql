/*
  Warnings:

  - You are about to drop the column `hashedRt` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[secret]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "hashedRt";

-- CreateIndex
CREATE UNIQUE INDEX "Profile_secret_key" ON "Profile"("secret");
