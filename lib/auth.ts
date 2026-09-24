import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const COOKIE_NAME = "lumina_session";
const secret = process.env.JWT_SECRET;
if (!secret)
  throw new Error("JWT_SECRET is not configured. Add it to .env.local.");

export type SessionUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: "admin" | "user";
  provider: "dummyjson" | "mongodb";
};

export function signSession(user: SessionUser) {
  return jwt.sign({ ...user }, secret, { expiresIn: "7d" });
}

export function verifySessionToken(token: string) {
  return jwt.verify(token, secret) as SessionUser & jwt.JwtPayload;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return verifySessionToken(token);
  } catch {
    return null;
  }
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export function sessionCookie(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  };
}

export { COOKIE_NAME };
