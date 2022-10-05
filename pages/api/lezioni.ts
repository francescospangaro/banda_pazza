import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/database'
import {Post, Put} from "@/types/api/lezioni";

async function lezioniRoute(req: NextApiRequest, res: NextApiResponse<Post.Response | Put.Response>) {
    const user = req.session.user;
    if(!user || user?.isLoggedIn !== true)
        return res.status(401).end();

    if(req.method === 'POST') {
        const { from, to } = (await req.body) as Post.Request;
        if(!from || !to)
            return res.status(400).end();

        const lezioni = await prisma.lezione.findMany({
            where: {
                docenteId: user.id,
                orarioDiInizio: { lte: to, gte: from },
            },
            include: {alunni: true, recuperataDa: true, recuperoDi: true},
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
    } else if(req.method === 'PUT') {
        const { id, libretto } = (await req.body) as Put.Request;
        if(!id)
            return res.status(400).end();

        (await prisma.$transaction(async tx => {
            const lezione = await prisma.lezione.findUnique({where: {id: id}, include: {recuperataDa: true}});
            if(!lezione)
                return () => res.status(404).end();
            if(lezione?.recuperataDa && libretto !== undefined)
                return () => res.status(400).end();

            await tx.lezione.update({
                data: {libretto: libretto},
                where: { id: id, },
            });

            return () => res.status(200).end();
        }))();
    }
}

export default withIronSessionApiRoute(lezioniRoute, sessionOptions)
