import { endpoint, asHandler } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/database";
import bcrypt from "bcrypt";
import { Get, Post, Put } from "@/types/api/admin/docente";

const getDocenti = endpoint(
  {
    method: "get",
    responseSchema: Get.ResponseValidator,
  },
  async () => {
    return {
      status: 200,
      body: (await prisma.docente.findMany({ where: { admin: false } })).map(
        (docente) => {
          return {
            id: docente.id,
            nome: docente.nome,
            cognome: docente.cognome,
            email: docente.email,
            cf: docente.cf,
            stipendioOrario: docente.stipendioOrario,
          };
        }
      ),
    };
  }
);

const addDocente = endpoint(
  {
    method: "post",
    bodySchema: Post.RequestValidator,
    responseSchema: Post.ResponseValidator,
  },
  async ({ body: toGenerate }) => {
    const docente = await prisma.docente.create({
      data: {
        nome: toGenerate.nome,
        cognome: toGenerate.cognome,
        email: toGenerate.email,
        cf: toGenerate.cf,
        stipendioOrario: toGenerate.stipendioOrario,
        password: bcrypt.hashSync(toGenerate.password, 12),
      },
    });

    return {
      status: 200,
      body: {
        id: docente.id,
        nome: docente.nome,
        cognome: docente.cognome,
        email: docente.email,
        cf: docente.cf,
        stipendioOrario: docente.stipendioOrario,
      },
    };
  }
);

const editDocente = endpoint(
  {
    method: "put",
    bodySchema: Put.RequestValidator,
    responseSchema: Put.ResponseValidator,
  },
  async ({ body: toEdit }) => {
    const docente = await prisma.docente.update({
      data: {
        nome: toEdit.nome ? toEdit.nome : undefined,
        cognome: toEdit.cognome ? toEdit.cognome : undefined,
        email: toEdit.email ? toEdit.email : undefined,
        cf: toEdit.cf ? toEdit.cf : undefined,
        stipendioOrario: toEdit.stipendioOrario ? toEdit.stipendioOrario : undefined,
        password: toEdit.password
          ? bcrypt.hashSync(toEdit.password, 12)
          : undefined,
      },
      where: { id: toEdit.id },
    });

    return {
      status: 200,
      body: {
        id: docente.id,
        nome: docente.nome,
        cognome: docente.cognome,
        email: docente.email,
        cf: docente.cf,
        stipendioOrario: docente.stipendioOrario,
      },
    };
  }
);

export default withIronSessionApiRoute(
  asHandler([getDocenti, addDocente, editDocente]),
  sessionOptions
);
