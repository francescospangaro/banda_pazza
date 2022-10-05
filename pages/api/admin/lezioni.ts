import {endpoint, asHandler} from "next-better-api";
import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {prisma} from '@/lib/database'
import {Post} from "@/types/api/admin/lezioni"

// TODO: this should be a get in the other file, but cba
const getFilteredLezioni = endpoint(
  {
    method: 'post',
    bodySchema: Post.RequestValidator,
    responseSchema: Post.ResponseValidator,
  },
  async ({body}) => {
    let {docente, alunno, startDate, endDate} = body;

    if(docente.nome === '') docente.nome = undefined;
    if(docente.cognome === '') docente.cognome = undefined;
    if(alunno.nome === '') alunno.nome = undefined;
    if(alunno.cognome === '') alunno.cognome = undefined;
    if(endDate === null) endDate = undefined;

    const lezioni = await prisma.lezione.findMany({
      where: {
        docente: docente.nome || docente.cognome ? {
          nome: docente.nome ? { contains: docente.nome } : undefined,
          cognome: docente.cognome ? { contains: docente.cognome } : undefined,
        } : undefined,
        alunni: alunno.nome || alunno.cognome ? {
          some: {
            nome: alunno.nome ? { contains: alunno.nome } : undefined,
            cognome: alunno.cognome ? { contains: alunno.cognome } : undefined,
          },
        } : undefined,
        orarioDiInizio: { gte: startDate },
        orarioDiFine: { lte: endDate }
      },
      include: {docente: true, alunni: true, recuperataDa: true, recuperoDi: true},
      orderBy: [{ orarioDiInizio: 'asc' }],
    });

    return {
      status: 200,
      body: lezioni.map(lezione => {
        return {
          id: lezione.id,
          docente: {
            id: lezione.docenteId,
            nome: lezione.docente.nome,
            cognome: lezione.docente.cognome,
          },
          alunni: lezione.alunni.map(alunno => {
            return {
              id: alunno.id,
              nome: alunno.nome,
              cognome: alunno.cognome,
            }
          }),
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
        }
      })
    };
  }
);

export default withIronSessionApiRoute(asHandler([getFilteredLezioni]), sessionOptions)
