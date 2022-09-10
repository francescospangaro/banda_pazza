/*
  Warnings:

  - Made the column `email` on table `docente` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `docente` MODIFY `email` VARCHAR(191) NOT NULL;
