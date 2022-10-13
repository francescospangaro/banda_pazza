/*
  Warnings:

  - A unique constraint covering the columns `[docenteId,orarioDiInizio,orarioDiFine,tipoLezione]` on the table `Lezione` will be added. If there are existing duplicate values, this will fail.

*/

-- AlterTable
ALTER TABLE `lezione` ADD COLUMN `tipoLezione` ENUM('NORMALE', 'SOLFEGGIO', 'TIPPETE', 'KOALA') NOT NULL DEFAULT 'NORMALE';

-- CreateIndex
CREATE UNIQUE INDEX `Lezione_docenteId_orarioDiInizio_orarioDiFine_tipoLezione_key` ON `Lezione`(`docenteId`, `orarioDiInizio`, `orarioDiFine`, `tipoLezione`);

-- DropIndex
DROP INDEX `Lezione_docenteId_orarioDiInizio_orarioDiFine_key` ON `lezione`;
