/*
  Warnings:

  - You are about to drop the column `orario` on the `lezione` table. All the data in the column will be lost.
  - Added the required column `orarioDiFine` to the `Lezione` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orarioDiInizio` to the `Lezione` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lezione` DROP COLUMN `orario`,
    ADD COLUMN `orarioDiFine` DATETIME(3) NOT NULL,
    ADD COLUMN `orarioDiInizio` DATETIME(3) NOT NULL;
