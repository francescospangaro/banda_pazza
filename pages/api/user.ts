import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '../../lib/session'
import { NextApiRequest, NextApiResponse } from 'next'

export type User = {
    email: string
    id: number
    admin: boolean
    isLoggedIn: boolean
    oreRecuperare: number
}

async function userRoute(req: NextApiRequest, res: NextApiResponse<User>) {
    if (req.session.user) {
        res.json({
            ...req.session.user,
            isLoggedIn: true,
        })
    } else {
        res.json({
            isLoggedIn: false,
            email: '',
            id: 0,
            admin: false,
            oreRecuperare: 0
        })
    }
}

export default withIronSessionApiRoute(userRoute, sessionOptions)