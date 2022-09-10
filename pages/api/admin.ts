import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '../../lib/session'
import { NextApiRequest, NextApiResponse } from 'next'

export type Admin = {
    email: string
    id: number
    admin: boolean
    isLoggedIn: boolean
}

async function userRoute(req: NextApiRequest, res: NextApiResponse<Admin>) {
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
            admin: false
        })
    }
}

export default withIronSessionApiRoute(userRoute, sessionOptions)