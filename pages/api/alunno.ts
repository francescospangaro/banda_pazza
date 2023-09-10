import { endpoint, asHandler } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/database";
import { Post } from "@/types/api/alunno";
import { getCurrentScholasticYear } from "@/lib/semesters";

const getAlunno = endpoint(
  {
    method: "post",
    responseSchema: Post.ResponseValidator,
    bodySchema: Post.RequestValidator,
  },

  async ({ req }) => {

    const [startYear, endYear] = getCurrentScholasticYear()
    const totLessonMinutes: number = Number((
      await prisma.$queryRaw<
        {
          minutes: unknown;
        }[]
      >`
        SELECT SUM(TIMESTAMPDIFF(MINUTE, orarioDiInizio, orarioDiFine)) as minutes
        FROM Lezione join _alunnotolezione on (Lezione.id = _alunnotolezione.B)
        WHERE docenteId = ${req.session.user!.id}
          AND A = ${req.body.id}
          AND recuperoId IS NULL
          AND orarioDiFine BETWEEN (CAST(${startYear.toJSON()} as DATETIME)) AND (CAST(${endYear.toJSON()} as DATETIME))
    `
    )[0]?.minutes ?? 0);

    const countedLessonMinutes: number = Number((
      await prisma.$queryRaw<
        {
          minutes: unknown;
        }[]
      >`
        SELECT SUM(TIMESTAMPDIFF(MINUTE, orarioDiInizio, orarioDiFine)) as minutes
        FROM Lezione join _alunnotolezione on (Lezione.id = _alunnotolezione.B)
        WHERE docenteId = ${req.session.user!.id}
          AND A = ${req.body.id}
          AND (libretto = 'PRESENTE' OR libretto = 'ASSENTE_NON_GIUSTIFICATO')
          AND orarioDiFine BETWEEN (CAST(${startYear.toJSON()} as DATETIME)) AND (CAST(${endYear.toJSON()} as DATETIME))
    `
    )[0]?.minutes ?? 0);

    const lezioni = await prisma.lezione.findMany({
      where: {
        docenteId: req.session.user!.id,
        alunni: { some: { id: req.body.id } },
        recuperoDi: null,
        orarioDiFine: { gte: startYear, lte: endYear },
      },
      include: { recuperataDa: true }
    });

    return {
      status: 200,
      body: {
        oreTotali: totLessonMinutes/60,
        oreFatte: countedLessonMinutes/60,
        oreMancanti: (totLessonMinutes/60) - (countedLessonMinutes/60),
        lezioni: lezioni.map((lezione) => {
          return {
            data: lezione.orarioDiInizio,
            risultato: lezione.libretto,
            recuperata: lezione.recuperataDa != null
          };
        }),
      }
    };
  }
);

export default withIronSessionApiRoute(
  asHandler([getAlunno]),
  sessionOptions
);
