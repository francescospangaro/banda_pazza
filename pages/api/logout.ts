import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import type { User } from '@/api/user'

function logoutRoute(req: NextApiRequest, res: NextApiResponse<User>) {
    req.session.destroy()
    res.json({ isLoggedIn: false, email: '', admin: false, id: 0, oreRecuperare: 0, })
}

export default withIronSessionApiRoute(logoutRoute, sessionOptions)
