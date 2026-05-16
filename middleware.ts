import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionSecret } from "@/lib/env";

const COOKIE = "klasskassa_session";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  if (path.startsWith("/groups")) {
    const url = req.nextUrl.clone();
    url.pathname = path.replace(/^\/groups/, "/classes");
    return NextResponse.redirect(url);
  }

  if (!path.startsWith("/classes")) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    const url = new URL("/login", req.url);
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(getSessionSecret());
    await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/classes/:path*", "/groups/:path*"],
};
