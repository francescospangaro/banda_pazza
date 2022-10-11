import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session/edge";
import { sessionOptions } from "@/lib/session";

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);
  const { user } = session;

  const isLoginRoute =
    req.nextUrl.pathname === "/api/login" ||
    req.nextUrl.pathname === "/api/logout";

  if (!isLoginRoute && user?.isLoggedIn !== true) {
    return new NextResponse(null, { status: 403 });
  }

  const isAdminRoute = req.nextUrl.pathname.startsWith("/api/admin/");
  if (isAdminRoute && user?.admin !== true) {
    return new NextResponse(null, { status: 403 });
  }

  return res;
};

export const config = {
  matcher: "/api/:path*",
};
