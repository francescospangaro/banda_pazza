import {endpoint, asHandler} from "next-better-api";
import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {prisma} from '@/lib/database'
import {Post, Delete} from "@/types/api/admin/lezione"

export function createDupesWhereClause(lezioni: {
    alunniIds: number[],
    docenteId: number,
    orarioDiInizio: Date,
    orarioDiFine: Date,
}[]) {
    return { OR: lezioni.flatMap(lezione => { return {AND: [
                { OR: [
                        {docenteId: lezione.docenteId},
                        {alunni: {some: {id: {in: lezione.alunniIds}}}}] },
                {NOT: [{orarioDiFine: lezione.orarioDiInizio}]},
                {NOT: [{orarioDiInizio: lezione.orarioDiFine}]},
                {OR: [
                        {AND: [
                                {orarioDiInizio: {lte: lezione.orarioDiInizio}},
                                {orarioDiFine: {gte: lezione.orarioDiInizio}}]},
                        {AND: [
                                {orarioDiInizio: {lte: lezione.orarioDiFine}},
                                {orarioDiFine: {gte: lezione.orarioDiFine}}]}
                    ]}
            ]}})};
}

const addLezioni = endpoint(
  {
      method: 'post',
      bodySchema: Post.RequestValidator,
      responseSchema: Post.ResponseValidator,
  },
  async ({body}) => {
      const lezioni = body.map(lezione => { return {
          ...lezione,
          orarioDiInizio: lezione.orario,
          orarioDiFine: (() => {
              const orarioDiFine = new Date(lezione.orario);
              orarioDiFine.setMinutes(orarioDiFine.getMinutes() + Number(lezione.durataInMin));
              return orarioDiFine
          })(),
      }});
      const alunniToLezioni = Array.from(lezioni.reduce((map, lezione) => {
          lezione.alunniIds.forEach(alunnoId => {
              if(!map.get(alunnoId))
                  map.set(alunnoId, []);
              map.get(alunnoId)!.push({
                  docenteId: lezione.docenteId,
                  orarioDiInizio: lezione.orarioDiInizio,
                  orarioDiFine: lezione.orarioDiFine,
                  solfeggio: lezione.solfeggio,
              });
          })
          return map;
      }, new Map<number, {
        docenteId: number,
        orarioDiInizio: Date,
        orarioDiFine: Date,
        solfeggio: boolean,
      }[]>()).entries());

      return (await prisma.$transaction(async (tx) => {
          const dupesWhereClause = createDupesWhereClause(lezioni);
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
                              };
                          })(),
                      }
                  }
              };

          await Promise.all(alunniToLezioni.map(([alunnoId, lezioniIn]) => tx.alunno.update({
              data: {
                  lezioni: {
                      connectOrCreate: lezioniIn.map(lezione => { return {
                          where: {docenteId_orarioDiInizio_orarioDiFine: lezione},
                          create: lezione,
                      }})
                  }
              },
              where: { id: alunnoId },
          })));
          return {status: 200};
      }));
  }
);

const deleteLezioni = endpoint(
  {
      method: 'delete',
      bodySchema: Delete.RequestValidator,
      responseSchema: Delete.ResponseValidator,
  },
  async ({body: lessons}) => {
      await prisma.lezione.deleteMany({
          where: { id: { in: lessons }},
      });
      return {status: 200};
  }
);

export default withIronSessionApiRoute(asHandler([addLezioni, deleteLezioni]), sessionOptions)
