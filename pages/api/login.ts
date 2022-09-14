import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '../../lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '../../lib/database'

const bcrypt = require("bcrypt")

async function loginRoute(req: NextApiRequest, res: NextApiResponse) {
    const {email, password} = await req.body
    if (!email || !password)
        return res.status(400).end();

    try {
        const user = await prisma.docente.findFirst({where: {email: email}})
        if (!user)
            return res.status(401).end();

        const match = await bcrypt.compare(password, user.password)
        if (!match)
            return res.status(401).end();

        req.session.user = {
            id: user.id,
            email: user.email,
            admin: user.admin,
            isLoggedIn: true,
            oreRecuperare: 0,
        }
        await req.session.save()

        res.status(200).json(req.session.user)
    } catch (error) {
        res.status(500).json({message: (error as Error).message})
    }
}

export default withIronSessionApiRoute(loginRoute, sessionOptions)
