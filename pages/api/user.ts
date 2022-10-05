import { withIronSessionApiRoute } from 'iron-session/next'
import { sessionOptions } from '@/lib/session'
import { NextApiRequest, NextApiResponse } from 'next'
import {Get} from "@/types/api/user"

async function userRoute(req: NextApiRequest, res: NextApiResponse<Get.Response>) {
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
