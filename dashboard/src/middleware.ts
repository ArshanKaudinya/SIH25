import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookieName, verifyToken } from "./lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isLogin = pathname === "/login";
  const needsAuth = pathname.startsWith("/dashboard");

  const cookie = req.cookies.get(cookieName)?.value;

  if (needsAuth) {
    if (!cookie) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname + search)}`, req.url));
    try { await verifyToken(cookie); }
    catch { return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(pathname + search)}`, req.url)); }
    return NextResponse.next();
  }

  if (isLogin && cookie) {
    try { await verifyToken(cookie); return NextResponse.redirect(new URL("/dashboard", req.url)); }
    catch { /* ignore, show login */ }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
