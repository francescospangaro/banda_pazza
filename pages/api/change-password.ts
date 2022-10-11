import { asHandler, endpoint } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { Post } from "@/types/api/change-password";
import { prisma } from "@/lib/database";
import bcrypt from "bcrypt";

const changePassword = endpoint(
  {
    method: "post",
    bodySchema: Post.RequestValidator,
    responseSchema: Post.ResponseValidator,
  },
  async ({ req, body }) => {
    const user = req.session.user!;
    return await prisma.$transaction(async (tx) => {
      const docente = await tx.docente.findUnique({
        where: { id: user.id },
      });

      if (!docente) return { status: 404 };

      const password = docente.password;
      const match = await bcrypt.compare(body.oldPassword, password);
      if (!match) return { status: 401 };

      await tx.docente.update({
        data: { password: await bcrypt.hash(body.newPassword, 12) },
        where: { id: user.id },
      });
      return { status: 200 };
    });
  }
);

export default withIronSessionApiRoute(
  asHandler([changePassword]),
  sessionOptions
);
