import {endpoint, asHandler} from "next-better-api";
import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {prisma} from '@/lib/database'
import {Get, Post} from "@/types/api/lezioni-da-giustificare";
import {createDupesWhereClause} from "@/api/admin/lezione"
import {Libretto} from '.prisma/client'

const getLezioniDaRecuperare = endpoint(
  {
      method: 'get',
      responseSchema: Get.ResponseValidator,
  },
  async ({req}) => {
      const lezioni = await prisma.lezione.findMany({
          where: {
              docenteId: req.session.user!.id,
              libretto: { in: [ Libretto.LEZIONE_SALTATA, Libretto.ASSENTE_GIUSTIFICATO, ] },
              recuperataDa: {is: null},
          },
          include: {alunni: true},
          orderBy: [{orarioDiInizio: 'asc'}],
      })

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
                  tipoLezione: lezione.tipoLezione,
              }
          })
      };
  }
);

const recuperaLezione = endpoint(
  {
      method: 'post',
      bodySchema: Post.RequestValidator,
      responseSchema: Post.ResponseValidator,
  },
  async ({body}) => {
      const {idDaRecuperare, orarioDiInizio} = body;
      return (await prisma.$transaction(async tx => {
          const lezioneDaRecuperare = await tx.lezione.findUnique({where: {id: idDaRecuperare}, include: { alunni: true}});
          if(!lezioneDaRecuperare)
              return {status: 404};

          const lezione = {
              docenteId: lezioneDaRecuperare.docenteId,
              alunniIds: lezioneDaRecuperare.alunni.map(alunno => alunno.id),
              orarioDiInizio: orarioDiInizio,
              orarioDiFine: (() => {
                  const orarioDiFine = new Date(orarioDiInizio);
                  const timeDiff = lezioneDaRecuperare.orarioDiFine.getTime() - lezioneDaRecuperare.orarioDiInizio.getTime();
                  orarioDiFine.setTime(orarioDiFine.getTime() + timeDiff);
                  return orarioDiFine;
              })(),
          }
          const dupesWhereClause = createDupesWhereClause([lezione]);
          const dupes = await tx.lezione.aggregate({
              where: dupesWhereClause,
              _count: {id: true},
          });

          const count = dupes._count.id;
          if (count > 0)
              return {
                  status: 400,
                  body: {
                      err: {
                          type: <"overlap"> "overlap",
                          count: count,
                          first: await (async () => {
                              const overlappingLesson = (await tx.lezione.findMany({
                                  where: dupesWhereClause,
                                  take: 1,
                              }))[0];

                              return {
                                  docenteId: overlappingLesson.docenteId,
                                  orarioDiInizio: overlappingLesson.orarioDiInizio,
                                  orarioDiFine: overlappingLesson.orarioDiFine,
                                  tipoLezione: overlappingLesson.tipoLezione,
                              };
                          })(),
                      }
                  }
              };

          await tx.lezione.create({ data: {
                  docente: {connect: {id: lezione.docenteId}},
                  alunni: {connect: lezione.alunniIds.map(id => {return {id}})},
                  orarioDiInizio: lezione.orarioDiInizio,
                  orarioDiFine: lezione.orarioDiFine,
                  recuperoDi: {connect: {id: lezioneDaRecuperare.id}},
              }});
          return {status: 200};
      }));
  }
);

export default withIronSessionApiRoute(asHandler([getLezioniDaRecuperare, recuperaLezione]), sessionOptions)
