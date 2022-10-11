import {endpoint, asHandler} from "next-better-api";
import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {prisma} from '@/lib/database'
import {Post, Put} from "@/types/api/lezioni";

const getLezioni = endpoint(
  {
      method: 'post',
      bodySchema: Post.RequestValidator,
      responseSchema: Post.ResponseValidator,
  },
  async ({body, req}) => {
      const {from, to} = body;
      const lezioni = await prisma.lezione.findMany({
          where: {
              docenteId: req.session.user!.id,
              orarioDiInizio: { lte: to, gte: from },
          },
          include: {alunni: true, recuperataDa: true, recuperoDi: true},
          orderBy: [{ orarioDiInizio: 'asc' }],
      });

      return {
          status: 200,
          body: lezioni.map(lezione => {
              return {
                  id: lezione.id,
                  alunni: lezione.alunni.map(alunno => { return {
                      nome: alunno.nome,
                      cognome: alunno.cognome,
                  }}),
                  orarioDiInizio: lezione.orarioDiInizio,
                  orarioDiFine: lezione.orarioDiFine,
                  libretto: lezione.libretto ?? undefined,
                  recuperataDa: lezione.recuperataDa ? {
                      id: lezione.recuperataDa.id,
                      orarioDiInizio: lezione.recuperataDa.orarioDiInizio,
                      orarioDiFine: lezione.recuperataDa.orarioDiFine,
                  } : undefined,
                  recuperoDi: lezione.recuperoDi ? {
                      id: lezione.recuperoDi.id,
                      orarioDiInizio: lezione.recuperoDi.orarioDiInizio,
                      orarioDiFine: lezione.recuperoDi.orarioDiFine,
                  } : undefined,
                  solfeggio: lezione.solfeggio,
              }
          })
      };
  }
);

const updateLezione = endpoint(
  {
      method: 'put',
      bodySchema: Put.RequestValidator,
      responseSchema: Put.ResponseValidator,
  },
  async ({body, req}) => {
      const { id, libretto } = body;
      return (await prisma.$transaction(async tx => {
          const lezione = await prisma.lezione.findUnique({where: {id: id}, include: {recuperataDa: true}});
          if(!lezione)
              return { status: 404 };
          if(lezione?.recuperataDa && libretto !== undefined)
              return { status: 400 };

          await tx.lezione.update({
              data: {libretto: libretto},
              where: { id: id, },
          });

          return { status: 200 };
      }));
  }
);

export default withIronSessionApiRoute(asHandler([getLezioni, updateLezione]), sessionOptions)
