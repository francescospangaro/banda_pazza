import { asHandler, endpoint } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/database";
import { Post } from "@/types/api/login";
import bcrypt from "bcrypt";

const login = endpoint(
  {
    method: "post",
    bodySchema: Post.RequestValidator,
    responseSchema: Post.ResponseValidator,
  },
  async ({ req, body }) => {
    const { email, password } = body;

    const user = await prisma.docente.findFirst({ where: { email: email } });
    if (!user) return { status: 401 };

    const match = await bcrypt.compare(password, user.password);
    if (!match) return { status: 401 };

    req.session.user = {
      id: user.id,
      email: user.email,
      admin: user.admin,
      isLoggedIn: true,
      oreRecuperare: 0,
    };
    await req.session.save();

    return {
      status: 200,
      body: req.session.user,
    };
  }
);

export default withIronSessionApiRoute(asHandler([login]), sessionOptions);
