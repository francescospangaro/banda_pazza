import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '../../lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '../../lib/database'
import {Lezione} from './lezioni'
import {Libretto} from '.prisma/client'

async function lezioniRoute(req: NextApiRequest, res: NextApiResponse<Lezione[]>) {
    const user = req.session.user;
    if (!user || user?.isLoggedIn !== true)
        return res.status(401).end();

    const lezioni = await prisma.lezione.findMany({
        where: {
            docenteId: user.id,
            libretto: { in: [ Libretto.LEZIONE_SALTATA, Libretto.ASSENTE_GIUSTIFICATO, ] }
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
    }))
}

export default withIronSessionApiRoute(lezioniRoute, sessionOptions)
