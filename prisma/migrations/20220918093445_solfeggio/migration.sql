/*
  Warnings:

  - You are about to drop the column `oreDiLavoro` on the `docente` table. All the data in the column will be lost.
  - You are about to drop the column `oreRecuperare` on the `docente` table. All the data in the column will be lost.
  - You are about to drop the column `solfeggio` on the `docente` table. All the data in the column will be lost.
  - You are about to drop the column `alunnoId` on the `lezione` table. All the data in the column will be lost.
  - You are about to drop the column `daRecuperare` on the `lezione` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[recuperoId]` on the table `Lezione` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `lezione` DROP FOREIGN KEY `Lezione_alunnoId_fkey`;

-- AlterTable
ALTER TABLE `docente` DROP COLUMN `oreDiLavoro`,
    DROP COLUMN `oreRecuperare`,
    DROP COLUMN `solfeggio`;

-- AlterTable
ALTER TABLE `lezione` DROP COLUMN `alunnoId`,
    DROP COLUMN `daRecuperare`,
    ADD COLUMN `recuperoId` INTEGER NULL;

-- CreateTable
CREATE TABLE `_AlunnoToLezione` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AlunnoToLezione_AB_unique`(`A`, `B`),
    INDEX `_AlunnoToLezione_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Lezione_recuperoId_key` ON `Lezione`(`recuperoId`);

-- AddForeignKey
ALTER TABLE `Lezione` ADD CONSTRAINT `Lezione_recuperoId_fkey` FOREIGN KEY (`recuperoId`) REFERENCES `Lezione`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlunnoToLezione` ADD CONSTRAINT `_AlunnoToLezione_A_fkey` FOREIGN KEY (`A`) REFERENCES `Alunno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlunnoToLezione` ADD CONSTRAINT `_AlunnoToLezione_B_fkey` FOREIGN KEY (`B`) REFERENCES `Lezione`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
