-- CreateTable
CREATE TABLE `Lezione` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `docenteId` INTEGER NOT NULL,
    `alunnoId` INTEGER NOT NULL,
    `orario` DATETIME(3) NOT NULL,
    `libretto` ENUM('PRESENTE', 'ASSENTE_GIUSTIFICATO', 'ASSENTE_NON_GIUSTIFICATO', 'LEZIONE_SALTATA') NULL,
    `note` VARCHAR(191) NULL,

    UNIQUE INDEX `Lezione_orario_key`(`orario`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Lezione` ADD CONSTRAINT `Lezione_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `Docente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lezione` ADD CONSTRAINT `Lezione_alunnoId_fkey` FOREIGN KEY (`alunnoId`) REFERENCES `Alunno`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
