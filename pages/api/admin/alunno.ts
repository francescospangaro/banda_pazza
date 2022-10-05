import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '@/lib/database'
import {Get, Post, Put} from "@/types/api/admin/alunno"

async function alunnoRoute(req: NextApiRequest, res: NextApiResponse<Get.Response | Post.Response | Put.Response>) {
    const user = req.session.user;
    if (!user || user?.isLoggedIn !== true || user?.admin !== true)
        return res.status(401).end();

    if(req.method === 'GET') {
        const alunni = await prisma.alunno.findMany({});
        res.status(200).json(alunni.map(alunno => { return {
            id: alunno.id,
            nome: alunno.nome,
            cognome: alunno.cognome,
            email: alunno.email,
            cf: alunno.cf,
            docenteId: alunno.docenteId,
        }}));
    } else if(req.method === 'POST') {
        const toGenerate = (await req.body) as Post.Request;
        if(!toGenerate || !toGenerate.nome || !toGenerate.cognome || !toGenerate.email || !toGenerate.cf || !toGenerate.docenteId)
            return res.status(400).end();

        const alunno = await prisma.alunno.create({
            data: {
                nome: toGenerate.nome,
                cognome: toGenerate.cognome,
                email: toGenerate.email,
                cf: toGenerate.cf,
                docenteId: toGenerate.docenteId,
                // TODO
                annoCorso: 0,
                annoIscrizione: '',
            }
        });

        res.status(200).json({
            id: alunno.id,
            nome: alunno.nome,
            cognome: alunno.cognome,
            email: alunno.email,
            cf: alunno.cf,
            docenteId: alunno.docenteId,
        });
    } else if(req.method === 'PUT') {
        const toEdit = (await req.body) as Put.Request;
        if(!toEdit || !toEdit.id)
            return res.status(400).end();

        const alunno = await prisma.alunno.update({
            data: {
                nome: toEdit.nome ? toEdit.nome : undefined,
                cognome: toEdit.cognome ? toEdit.cognome : undefined,
                email: toEdit.email ? toEdit.email : undefined,
                cf: toEdit.cf ? toEdit.cf : undefined,
                docenteId: toEdit.docenteId ? Number(toEdit.docenteId) : undefined,
            },
            where: {id: toEdit.id}
        });

        res.status(200).json({
            id: alunno.id,
            nome: alunno.nome,
            cognome: alunno.cognome,
            email: alunno.email,
            cf: alunno.cf,
            docenteId: alunno.docenteId,
        });
    }
}

export default withIronSessionApiRoute(alunnoRoute, sessionOptions)
