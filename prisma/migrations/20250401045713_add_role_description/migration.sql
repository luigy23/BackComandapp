/*
  Warnings:

  - You are about to drop the column `userId` on the `order` table. All the data in the column will be lost.
  - Added the required column `waiterId` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `order` DROP FOREIGN KEY `Order_userId_fkey`;

-- DropIndex
DROP INDEX `Order_userId_fkey` ON `order`;

-- AlterTable
ALTER TABLE `order` DROP COLUMN `userId`,
    ADD COLUMN `waiterId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `role` ADD COLUMN `description` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_waiterId_fkey` FOREIGN KEY (`waiterId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
