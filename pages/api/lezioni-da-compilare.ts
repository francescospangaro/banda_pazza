import { endpoint, asHandler } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/database";
import { Get } from "@/types/api/lezioni-da-compilare";

const getLezioniDaCompilare = endpoint(
  {
    method: "get",
    responseSchema: Get.ResponseValidator,
  },
  async ({ req }) => {
    const lezioni = await prisma.lezione.findMany({
      where: {
        docenteId: req.session.user!.id,
        libretto: { equals: null },
        orarioDiFine: { lt: new Date() },
      },
      include: { alunni: true },
    });

    return {
      status: 200,
      body: lezioni.map((lezione) => {
        return {
          id: lezione.id,
          alunni: lezione.alunni.map((alunno) => {
            return {
              nome: alunno.nome,
              cognome: alunno.cognome,
            };
          }),
          orarioDiInizio: lezione.orarioDiInizio,
          orarioDiFine: lezione.orarioDiFine,
          tipoLezione: lezione.tipoLezione,
        };
      }),
    };
  }
);

export default withIronSessionApiRoute(
  asHandler([getLezioniDaCompilare]),
  sessionOptions
);
