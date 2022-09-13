-- AlterTable
ALTER TABLE `docente` ADD COLUMN `oreRecuperare` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `lezione` ADD COLUMN `daRecuperare` INTEGER NOT NULL DEFAULT 0;
