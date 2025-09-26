import { NextResponse } from "next/server";
import { cookieName, makeToken, MAX_AGE_SECONDS } from "@/lib/auth";

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const u = process.env.GOV_ADMIN_USER;
  const p = process.env.GOV_ADMIN_PASS;
  if (!u || !p) return NextResponse.json({ ok: false, error: "Server auth not configured" }, { status: 500 });

  if (username === u && password === p) {
    const jwt = await makeToken(username);
    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieName, jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_AGE_SECONDS,
    });
    return res;
  }
  return NextResponse.json({ ok: false, error: "Invalid credentials" }, { status: 401 });
}
