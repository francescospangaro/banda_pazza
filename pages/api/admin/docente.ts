import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '@/lib/database'
import bcrypt from "bcrypt"
import {Get, Post, Put} from "@/types/api/admin/docente"

async function docenteRoute(req: NextApiRequest, res: NextApiResponse<Get.Response | Post.Response | Put.Response>) {
    const user = req.session.user;
    if (!user || user?.isLoggedIn !== true || user?.admin !== true)
        return res.status(401).end();

    if(req.method === 'GET') {
        const docenti = await prisma.docente.findMany({});
        res.status(200).json(docenti.map(docente => { return {
            id: docente.id,
            nome: docente.nome,
            cognome: docente.cognome,
            email: docente.email,
            cf: docente.cf,
        }}));
    } else if(req.method === 'POST') {
        const toGenerate = (await req.body) as Post.Request;
        if(!toGenerate ||
            !toGenerate.nome || !toGenerate.cognome || !toGenerate.email ||
            !toGenerate.cf || !toGenerate.password)
            return res.status(400).end();

        const docente = await prisma.docente.create({
            data: {
                nome: toGenerate.nome,
                cognome: toGenerate.cognome,
                email: toGenerate.email,
                cf: toGenerate.cf,
                password: bcrypt.hashSync(toGenerate.password, 12),
            }
        });

        res.status(200).json({
            id: docente.id,
            nome: docente.nome,
            cognome: docente.cognome,
            email: docente.email,
            cf: docente.cf,
        });
    } else if(req.method === 'PUT') {
        const toEdit = (await req.body) as Put.Request;
        if(!toEdit || !toEdit.id)
            return res.status(400).end();

        const docente = await prisma.docente.update({
            data: {
                nome: toEdit.nome ? toEdit.nome : undefined,
                cognome: toEdit.cognome ? toEdit.cognome : undefined,
                email: toEdit.email ? toEdit.email : undefined,
                cf: toEdit.cf ? toEdit.cf : undefined,
                password: toEdit.password ? bcrypt.hashSync(toEdit.password, 12) : undefined,
            },
            where: {id: toEdit.id}
        });

        res.status(200).json({
            id: docente.id,
            nome: docente.nome,
            cognome: docente.cognome,
            email: docente.email,
            cf: docente.cf,
        });
    }
}

export default withIronSessionApiRoute(docenteRoute, sessionOptions)
