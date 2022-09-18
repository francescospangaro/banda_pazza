import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '../../lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '../../lib/database'
import {Lezione} from './lezioni'
import {Libretto} from '.prisma/client'

export type LezioneDiRecupero = {
    idDaRecuperare: number,
    orarioDiInizio: Date,
}

async function lezioniRoute(req: NextApiRequest, res: NextApiResponse<Lezione[]>) {
    const user = req.session.user;
    if (!user || user?.isLoggedIn !== true)
        return res.status(401).end();

    if(req.method === "GET") {
        const lezioni = await prisma.lezione.findMany({
            where: {
                docenteId: user.id,
                libretto: { in: [ Libretto.LEZIONE_SALTATA, Libretto.ASSENTE_GIUSTIFICATO, ] },
                recuperataDa: {is: null},
            },
            include: {alunni: true},
            orderBy: [{orarioDiInizio: 'asc'}],
        })

        res.status(200).json(lezioni.map(lezione => {
            return {
                id: lezione.id,
                alunni: lezione.alunni.map(alunno => { return {
                    nome: alunno.nome,
                    cognome: alunno.cognome,
                }}),
                orarioDiInizio: lezione.orarioDiInizio,
                orarioDiFine: lezione.orarioDiFine,
            }
        }));
    } else if(req.method === "POST") {
        let {idDaRecuperare, orarioDiInizio} = (await req.body) as LezioneDiRecupero;
        if(!idDaRecuperare || !orarioDiInizio)
            return res.status(400).end();
        orarioDiInizio = new Date(orarioDiInizio);

        (await prisma.$transaction(async tx => {
            const lezioneDaRecuperare = await tx.lezione.findUnique({where: {id: idDaRecuperare}, include: { alunni: true}});
            if(!lezioneDaRecuperare)
                return () => res.status(404).end();

            await tx.lezione.create({ data: {
                    docente: {connect: {id: lezioneDaRecuperare.docenteId}},
                    alunni: {connect: lezioneDaRecuperare.alunni.map(alunno => {return {id: alunno.id}})},
                    orarioDiInizio: orarioDiInizio,
                    orarioDiFine: (() => {
                        const orarioDiFine = new Date(orarioDiInizio);
                        const timeDiff = lezioneDaRecuperare.orarioDiFine.getTime() - lezioneDaRecuperare.orarioDiInizio.getTime();
                        orarioDiFine.setTime(orarioDiFine.getTime() + timeDiff);
                        return orarioDiFine;
                    })(),
                    recuperoDi: {connect: {id: lezioneDaRecuperare.id}},
                }});
            return () => res.status(200).end();
        }))();
    }
}

export default withIronSessionApiRoute(lezioniRoute, sessionOptions)
