import { endpoint, asHandler } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { prisma } from "@/lib/database";
import { Post } from "@/types/api/admin/payments";
import { Libretto } from "@prisma/client";

const payLessons = endpoint(
  {
    method: "post",
    bodySchema: Post.RequestValidator,
    responseSchema: Post.ResponseValidator,
  },
  async ({ body }) => {
    await prisma.lezione.updateMany({
      where: {
        docenteId: body.docenteId,
        libretto: {
          in: [Libretto.PRESENTE, Libretto.ASSENTE_NON_GIUSTIFICATO],
        },
        orarioDiFine: { lte: new Date() },
      },
      data: { paid: true },
    });

    return { status: 200 };
  }
);

export default withIronSessionApiRoute(asHandler([payLessons]), sessionOptions);
