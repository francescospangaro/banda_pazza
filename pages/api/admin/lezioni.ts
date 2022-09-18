import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '../../../lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../lib/database'
import {Libretto} from '../lezioni'

export {Libretto} from "../lezioni"
export type Lezione = {
    id: number,
    alunni: {
        id: number,
        nome: string,
        cognome: string,
    }[],
    docente: {
        id: number,
        nome: string,
        cognome: string,
    },
    orarioDiInizio: Date,
    orarioDiFine: Date,
    libretto?: Libretto | null,
    recuperataDa?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
    recuperoDi?: {id: number, orarioDiInizio: Date, orarioDiFine: Date},
}

async function lezioniRoute(req: NextApiRequest, res: NextApiResponse<Lezione[]>) {
    let { docente, alunno, startDate, endDate } = await req.body;
    const user = req.session.user;

    if(!user || user?.isLoggedIn !== true || user?.admin !== true)
        return res.status(401).end();
    if(!startDate)
        return res.status(400).end();

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

    res.status(200).json(lezioni.map(lezione => {
        return {
            id: lezione.id,
            docente: {
                id: lezione.docenteId,
                nome: lezione.docente.nome,
                cognome: lezione.docente.cognome,
            },
            alunni: lezione.alunni.map(alunno => { return {
                id: alunno.id,
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
        }
    }));
}

export default withIronSessionApiRoute(lezioniRoute, sessionOptions)
