import { endpoint, asHandler } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { Post } from "@/types/api/logout";

const logout = endpoint(
  {
    method: "post",
    responseSchema: Post.ResponseValidator,
  },
  async ({ req }) => {
    req.session.destroy();
    return {
      status: 200,
      body: {
        isLoggedIn: false,
        email: "",
        admin: false,
        id: 0,
        oreRecuperare: 0,
      },
    };
  }
);

export default withIronSessionApiRoute(asHandler([logout]), sessionOptions);
