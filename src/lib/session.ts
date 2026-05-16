import { SignJWT, jwtVerify } from "jose";
import { getSessionSecret } from "@/lib/env";

const COOKIE = "klasskassa_session";

function getSecretBytes() {
  const s = getSessionSecret();
  if (s.length < 16) {
    throw new Error("SESSION_SECRET must be at least 16 characters");
  }
  return new TextEncoder().encode(s);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecretBytes());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretBytes(), { algorithms: ["HS256"] });
    const sub = payload.sub;
    if (typeof sub !== "string" || !sub) return null;
    return { userId: sub };
  } catch {
    return null;
  }
}

export const sessionCookieName = COOKIE;

export function sessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/" as const,
    maxAge: 60 * 60 * 24 * 30,
  };
}
