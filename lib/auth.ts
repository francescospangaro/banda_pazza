import {withIronSessionSsr} from "iron-session/next";
import {sessionOptions} from "./session";
import {GetServerSidePropsContext, GetServerSidePropsResult} from "next";

export default (gssp: (
    context: GetServerSidePropsContext,
) => Promise<GetServerSidePropsResult<any>>) =>
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

        return gssp(ctx);
    }, sessionOptions);