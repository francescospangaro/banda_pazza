import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '../../lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../lib/database'

export const Libretto = {
    PRESENTE: 'PRESENTE',
    ASSENTE_GIUSTIFICATO: 'ASSENTE_GIUSTIFICATO',
    ASSENTE_NON_GIUSTIFICATO: 'ASSENTE_NON_GIUSTIFICATO',
    LEZIONE_SALTATA: 'LEZIONE_SALTATA'
};

export type Libretto = 'PRESENTE' | 'ASSENTE_GIUSTIFICATO' | 'ASSENTE_NON_GIUSTIFICATO' | 'LEZIONE_SALTATA';
export type Lezione = {
    id: number,
    alunni: {
        nome: string;
        cognome: string;
    }[],
    orarioDiInizio: Date,
    orarioDiFine: Date,
    libretto?: Libretto | null,
    note?: string,
}

async function lezioniRoute(req: NextApiRequest, res: NextApiResponse<Lezione[]>) {
    const user = req.session.user;
    if(!user || user?.isLoggedIn !== true)
        return res.status(401).end();

    if(req.method === 'POST') {
        const { from, to } = await req.body;
        if(!from || !to)
            return res.status(400).end();

        const lezioni = await prisma.lezione.findMany({
            where: {
                docenteId: user.id,
                orarioDiInizio: { lte: to, gte: from },
            },
            include: { alunni: true },
            orderBy: [{ orarioDiInizio: 'asc' }],
        });

        res.status(200).json(lezioni.map(lezione => {
            return {
                id: lezione.id,
                alunni: lezione.alunni.map(alunno => { return {
                    nome: alunno.nome,
                    cognome: alunno.cognome,
                }}),
                orarioDiInizio: lezione.orarioDiInizio,
                orarioDiFine: lezione.orarioDiFine,
                libretto: lezione.libretto ?? undefined,
                note: lezione.note ?? undefined,
            }
        }));
    } else if(req.method === 'PUT') {
        const { id, libretto, note } = await req.body;
        if(!id)
            return res.status(400).end();

        await prisma.lezione.update({
            data: {
                libretto: libretto,
                note: note
            },
            where: { id: id, },
        });

        res.status(200).end();
    }
}

export default withIronSessionApiRoute(lezioniRoute, sessionOptions)
