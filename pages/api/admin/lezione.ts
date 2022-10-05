import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {NextApiRequest, NextApiResponse} from 'next'
import {prisma} from '@/lib/database'
import {Post, Delete} from "@/types/api/admin/lezione"

export function createDupesWhereClause(lezioni: {
    alunniIds: number[],
    docenteId: number,
    orarioDiInizio: Date,
    orarioDiFine: Date,
}[]) {
    return { OR: lezioni.flatMap(lezione => { return {AND: [
                { OR: [
                        {docenteId: lezione.docenteId},
                        {alunni: {some: {id: {in: lezione.alunniIds}}}}] },
                {NOT: [{orarioDiFine: lezione.orarioDiInizio}]},
                {NOT: [{orarioDiInizio: lezione.orarioDiFine}]},
                {OR: [
                        {AND: [
                                {orarioDiInizio: {lte: lezione.orarioDiInizio}},
                                {orarioDiFine: {gte: lezione.orarioDiInizio}}]},
                        {AND: [
                                {orarioDiInizio: {lte: lezione.orarioDiFine}},
                                {orarioDiFine: {gte: lezione.orarioDiFine}}]}
                    ]}
            ]}})};
}

async function lezioneRoute(req: NextApiRequest, res: NextApiResponse<Post.Response | Delete.Response>) {
    const user = req.session.user;
    if (!user || user?.isLoggedIn !== true || user?.admin !== true)
        return res.status(401).end();

    if(req.method === 'POST') {
        const body = await req.body;
        if (!body)
            return res.status(400).end();

        const lezioni = (body as Post.Request).map(lezione => { return {
            alunniIds: lezione.alunniIds.map(id => Number(id)),
            docenteId: Number(lezione.docenteId),
            orarioDiInizio: new Date(lezione.orario),
            orarioDiFine: (() => {
                const orarioDiFine = new Date(lezione.orario);
                orarioDiFine.setMinutes(orarioDiFine.getMinutes() + Number(lezione.durataInMin));
                return orarioDiFine
            })(),
        }});
        const alunniToLezioni = Array.from(lezioni.reduce((map, lezione) => {
            lezione.alunniIds.forEach(alunnoId => {
                if(!map.get(alunnoId))
                    map.set(alunnoId, []);
                map.get(alunnoId)!.push({
                    docenteId: lezione.docenteId,
                    orarioDiInizio: lezione.orarioDiInizio,
                    orarioDiFine: lezione.orarioDiFine,
                });
            })
            return map;
        }, new Map<number, { docenteId: number, orarioDiInizio: Date, orarioDiFine: Date, }[]>()).entries());

        (await prisma.$transaction(async (tx) => {
            const dupesWhereClause = createDupesWhereClause(lezioni);
            const dupes = await tx.lezione.aggregate({
                where: dupesWhereClause,
                _count: {id: true},
            });

            const count = dupes._count.id;
            if (count > 0)
                return async () => res.status(400).json({
                    err: {
                        type: "overlap",
                        count: count,
                        first: await (async () => {
                            const overlappingLesson = (await tx.lezione.findMany({
                                where: dupesWhereClause,
                                take: 1,
                            }))[0];

                            return {
                                docenteId: overlappingLesson.docenteId,
                                orarioDiInizio: overlappingLesson.orarioDiInizio,
                                orarioDiFine: overlappingLesson.orarioDiFine,
                            };
                        })(),
                    }
                });

            await Promise.all(alunniToLezioni.map(([alunnoId, lezioniIn]) => tx.alunno.update({
                data: {
                    lezioni: {
                        connectOrCreate: lezioniIn.map(lezione => { return {
                            where: {docenteId_orarioDiInizio_orarioDiFine: lezione},
                            create: lezione,
                        }})
                    }
                },
                where: { id: alunnoId },
            })));
            return () => res.status(200).end();
        }))();
    } else if(req.method === 'DELETE') {
        const lessons = (await req.body) as Delete.Request;
        if (!lessons)
            return res.status(200).end();

        await prisma.lezione.deleteMany({
            where: { id: { in: lessons.map((lezioneId: any) => Number(lezioneId)) }},
        });
        res.status(200).end();
    }
}

export default withIronSessionApiRoute(lezioneRoute, sessionOptions)
