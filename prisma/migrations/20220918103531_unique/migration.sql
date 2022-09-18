/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `Alunno` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[docenteId,orarioDiInizio,orarioDiFine]` on the table `Lezione` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Alunno_email_key` ON `Alunno`(`email`);

-- CreateIndex
CREATE UNIQUE INDEX `Lezione_docenteId_orarioDiInizio_orarioDiFine_key` ON `Lezione`(`docenteId`, `orarioDiInizio`, `orarioDiFine`);
