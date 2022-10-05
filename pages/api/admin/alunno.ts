import {endpoint, asHandler} from 'next-better-api';
import {withIronSessionApiRoute} from 'iron-session/next'
import {sessionOptions} from '@/lib/session'
import {prisma} from '@/lib/database'
import {Get, Post, Put} from "@/types/api/admin/alunno"

const getAlunni = endpoint(
  {
      method: 'get',
      responseSchema: Get.ResponseValidator
  },
  async () => {
      return {
          status: 200,
          body: (await prisma.alunno.findMany({})).map(alunno => { return {
              id: alunno.id,
              nome: alunno.nome,
              cognome: alunno.cognome,
              email: alunno.email,
              cf: alunno.cf,
              docenteId: alunno.docenteId,
          }})
      };
  }
);

const addAlunno = endpoint(
  {
      method: 'post',
      bodySchema: Post.RequestValidator,
      responseSchema: Post.ResponseValidator
  },
  async ({body: toGenerate}) => {
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

      return {
          status: 200,
          body: {
              id: alunno.id,
              nome: alunno.nome,
              cognome: alunno.cognome,
              email: alunno.email,
              cf: alunno.cf,
              docenteId: alunno.docenteId,
          }
      };
  }
);

const editAlunno = endpoint(
  {
      method: 'put',
      bodySchema: Put.RequestValidator,
      responseSchema: Put.ResponseValidator
  },
  async ({body: toEdit}) => {
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

      return {
          status: 200,
          body: {
              id: alunno.id,
              nome: alunno.nome,
              cognome: alunno.cognome,
              email: alunno.email,
              cf: alunno.cf,
              docenteId: alunno.docenteId,
          }
      };
  }
);

export default withIronSessionApiRoute(asHandler([getAlunni, addAlunno, editAlunno]), sessionOptions)
