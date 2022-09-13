import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '../../../lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {PrismaClient} from "@prisma/client";

export type LezioneToGenerate = {
    alunnoId: number,
    docenteId: number,
    orario: Date,
    durataInMin: number,
}

async function lezioneRoute(req: NextApiRequest, res: NextApiResponse) {
    const user = req.session.user;
    if (!user || user?.isLoggedIn !== true || user?.admin !== true)
        return res.status(401).end();

    if(req.method === 'POST') {
        const lessons = (await req.body) as LezioneToGenerate[];
        if (!lessons)
            return res.status(400).end();

        const databaseLessons = lessons.map(lezione => {
            return {
                docenteId: Number(lezione.docenteId),
                alunnoId: Number(lezione.alunnoId),
                orarioDiInizio: new Date(lezione.orario),
                orarioDiFine: (() => {
                    const orarioDiFine = new Date(lezione.orario);
                    orarioDiFine.setMinutes(orarioDiFine.getMinutes() + Number(lezione.durataInMin));
                    return orarioDiFine
                })(),
            }
        });

        const prisma = new PrismaClient();
        const dupes = await prisma.lezione.aggregate({
            where: {
                OR: databaseLessons.flatMap(lezione => {
                    return [
                        {
                            AND: [
                                {orarioDiInizio: {lt: lezione.orarioDiInizio}},
                                {orarioDiFine: {gt: lezione.orarioDiInizio}}]
                        },
                        {
                            AND: [
                                {orarioDiInizio: {lt: lezione.orarioDiFine}},
                                {orarioDiFine: {gt: lezione.orarioDiFine}}]
                        },
                    ]
                })
            },
            _count: {id: true},
        });

        const count = dupes._count.id;
        if (count > 0) {
            res.status(400).json({
                err: {
                    type: "overlap",
                    count: count,
                    first: (await prisma.lezione.findMany({
                        where: {
                            OR: databaseLessons.flatMap(lezione => {
                                return [
                                    {
                                        AND: [
                                            {orarioDiInizio: {lte: lezione.orarioDiInizio}},
                                            {orarioDiFine: {gte: lezione.orarioDiInizio}}]
                                    },
                                    {
                                        AND: [
                                            {orarioDiInizio: {lte: lezione.orarioDiFine}},
                                            {orarioDiFine: {gte: lezione.orarioDiFine}}]
                                    },
                                ]
                            })
                        },
                        take: 1,
                    }))[0],
                }
            });
            return;
        }

        await prisma.lezione.createMany({data: databaseLessons});
        res.status(200).end();
    } else if(req.method === 'DELETE') {
        const lessons = await req.body;
        if (!lessons)
            return res.status(200).end();

        console.log(lessons)
        const prisma = new PrismaClient();
        await prisma.lezione.deleteMany({
            where: { id: { in: lessons.map((lezioneId: any) => Number(lezioneId)) }},
        });
        res.status(200).end();
    }
}

export default withIronSessionApiRoute(lezioneRoute, sessionOptions)
