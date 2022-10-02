-- CreateTable
CREATE TABLE `Docente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cf` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(191) NOT NULL,
    `cognome` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `admin` BOOLEAN NOT NULL DEFAULT false,
    `password` VARCHAR(191) NOT NULL,

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
    `annoIscrizione` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Alunno_cf_key`(`cf`),
    UNIQUE INDEX `Alunno_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lezione` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docenteId` INTEGER NOT NULL,
    `orarioDiInizio` DATETIME(3) NOT NULL,
    `orarioDiFine` DATETIME(3) NOT NULL,
    `libretto` ENUM('PRESENTE', 'ASSENTE_GIUSTIFICATO', 'ASSENTE_NON_GIUSTIFICATO', 'LEZIONE_SALTATA') NULL,
    `recuperoId` INTEGER NULL,

    UNIQUE INDEX `Lezione_recuperoId_key`(`recuperoId`),
    UNIQUE INDEX `Lezione_docenteId_orarioDiInizio_orarioDiFine_key`(`docenteId`, `orarioDiInizio`, `orarioDiFine`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_AlunnoToLezione` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_AlunnoToLezione_AB_unique`(`A`, `B`),
    INDEX `_AlunnoToLezione_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Alunno` ADD CONSTRAINT `Alunno_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lezione` ADD CONSTRAINT `Lezione_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lezione` ADD CONSTRAINT `Lezione_recuperoId_fkey` FOREIGN KEY (`recuperoId`) REFERENCES `Lezione`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlunnoToLezione` ADD CONSTRAINT `_AlunnoToLezione_A_fkey` FOREIGN KEY (`A`) REFERENCES `Alunno`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_AlunnoToLezione` ADD CONSTRAINT `_AlunnoToLezione_B_fkey` FOREIGN KEY (`B`) REFERENCES `Lezione`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
