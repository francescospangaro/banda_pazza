import {withIronSessionSsr} from "iron-session/next";
import {sessionOptions} from "./session";
import {GetServerSidePropsContext, GetServerSidePropsResult} from "next";

const requireAuth = <P  extends { [key: string]: unknown } = { [key: string]: unknown }>(gssp: (
    context: GetServerSidePropsContext,
) => Promise<GetServerSidePropsResult<P>>, admin?: boolean) =>
    withIronSessionSsr(async (ctx) => {
        const user = ctx.req.session.user;

        if (!user) {
            return {
                redirect: {
                    permanent: false,
                    destination: "/login",
                },
            };
        }

        if (admin && !user.admin) {
            return {
                redirect: {
                    permanent: false,
                    destination: "/",
                },
            };
        }

        return gssp(ctx);
    }, sessionOptions);

export default requireAuth;
