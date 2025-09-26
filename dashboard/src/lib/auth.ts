import { SignJWT, jwtVerify } from "jose";

const cookieName = "gov_session";
const alg = "HS256";

export const MAX_AGE_SECONDS = 60 * 60 * 8;

export function getSecret(): Uint8Array {
  const s = process.env.DASHBOARD_JWT_SECRET;
  if (!s) throw new Error("DASHBOARD_JWT_SECRET missing");
  return new TextEncoder().encode(s);
}

export async function makeToken(username: string) {
  return await new SignJWT({ sub: username, role: "gov" })
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret(), { algorithms: [alg] });
  return payload as { sub?: string; role?: string; exp?: number; iat?: number };
}

export { cookieName };
