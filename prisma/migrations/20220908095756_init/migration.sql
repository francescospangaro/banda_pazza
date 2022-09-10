-- CreateTable
CREATE TABLE `Docente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cf` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cognome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `solfeggio` BOOLEAN NOT NULL DEFAULT false,
    `admin` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `Docente_cf_key`(`cf`),
    UNIQUE INDEX `Docente_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Alunno` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cf` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cognome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `docenteId` INTEGER NOT NULL,
    `annoCorso` INTEGER NOT NULL,
    `annoIscrizione` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Alunno_cf_key`(`cf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alunno` ADD CONSTRAINT `Alunno_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
