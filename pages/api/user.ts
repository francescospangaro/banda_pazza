import { endpoint, asHandler } from "next-better-api";
import { withIronSessionApiRoute } from "iron-session/next";
import { sessionOptions } from "@/lib/session";
import { Get } from "@/types/api/user";

const getUser = endpoint(
  {
    method: "get",
    responseSchema: Get.ResponseValidator,
  },
  async ({ req }) => {
    return {
      status: 200,
      body: req.session.user
        ? {
            ...req.session.user,
            isLoggedIn: true,
          }
        : {
            isLoggedIn: false,
            email: "",
            id: 0,
            admin: false,
            oreRecuperare: 0,
          },
    };
  }
);

export default withIronSessionApiRoute(asHandler([getUser]), sessionOptions);
