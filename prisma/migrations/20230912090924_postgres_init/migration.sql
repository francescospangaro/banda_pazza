-- CreateEnum
CREATE TYPE "Libretto" AS ENUM ('PRESENTE', 'ASSENTE_GIUSTIFICATO', 'ASSENTE_NON_GIUSTIFICATO', 'LEZIONE_SALTATA');

-- CreateEnum
CREATE TYPE "TipoLezione" AS ENUM ('NORMALE', 'SOLFEGGIO', 'TIPPETE', 'KOALA');

-- CreateTable
CREATE TABLE "Docente" (
    "id" SERIAL NOT NULL,
    "cf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "stipendioOrario" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Docente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alunno" (
    "id" SERIAL NOT NULL,
    "cf" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cognome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "annoCorso" INTEGER NOT NULL,
    "annoIscrizione" TEXT NOT NULL,

    CONSTRAINT "Alunno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lezione" (
    "id" SERIAL NOT NULL,
    "docenteId" INTEGER NOT NULL,
    "orarioDiInizio" TIMESTAMP(3) NOT NULL,
    "orarioDiFine" TIMESTAMP(3) NOT NULL,
    "libretto" "Libretto",
    "recuperoId" INTEGER,
    "tipoLezione" "TipoLezione" NOT NULL DEFAULT 'NORMALE',
    "paid" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Lezione_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AlunnoToLezione" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Docente_cf_key" ON "Docente"("cf");

-- CreateIndex
CREATE UNIQUE INDEX "Docente_email_key" ON "Docente"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Alunno_cf_key" ON "Alunno"("cf");

-- CreateIndex
CREATE UNIQUE INDEX "Alunno_email_key" ON "Alunno"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lezione_recuperoId_key" ON "Lezione"("recuperoId");

-- CreateIndex
CREATE UNIQUE INDEX "Lezione_docenteId_orarioDiInizio_orarioDiFine_tipoLezione_key" ON "Lezione"("docenteId", "orarioDiInizio", "orarioDiFine", "tipoLezione");

-- CreateIndex
CREATE UNIQUE INDEX "_AlunnoToLezione_AB_unique" ON "_AlunnoToLezione"("A", "B");

-- CreateIndex
CREATE INDEX "_AlunnoToLezione_B_index" ON "_AlunnoToLezione"("B");

-- AddForeignKey
ALTER TABLE "Alunno" ADD CONSTRAINT "Alunno_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lezione" ADD CONSTRAINT "Lezione_docenteId_fkey" FOREIGN KEY ("docenteId") REFERENCES "Docente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lezione" ADD CONSTRAINT "Lezione_recuperoId_fkey" FOREIGN KEY ("recuperoId") REFERENCES "Lezione"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunnoToLezione" ADD CONSTRAINT "_AlunnoToLezione_A_fkey" FOREIGN KEY ("A") REFERENCES "Alunno"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AlunnoToLezione" ADD CONSTRAINT "_AlunnoToLezione_B_fkey" FOREIGN KEY ("B") REFERENCES "Lezione"("id") ON DELETE CASCADE ON UPDATE CASCADE;
