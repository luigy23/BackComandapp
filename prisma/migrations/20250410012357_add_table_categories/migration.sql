-- AlterTable
ALTER TABLE `diningtable` ADD COLUMN `categoryId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TableCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TableCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `DiningTable` ADD CONSTRAINT `DiningTable_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `TableCategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
