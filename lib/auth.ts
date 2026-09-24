import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export type SessionUser = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  role: "admin" | "user";
  provider: "dummyjson" | "mongodb";
};

export const sessionCookie = (token: string) => ({
  name: "lumina_session",
  value: token,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
});

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return secret;
}

export function signSession(user: SessionUser) {
  return jwt.sign(
    { ...user },
    getJwtSecret(),
    { expiresIn: "7d" },
  );
}

export function verifySessionToken(token: string) {
  try {
    return jwt.verify(
      token,
      getJwtSecret(),
    ) as SessionUser;
  } catch {
    return null;
  }
}

export async function getSessionUser() {
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "lumina_session",
  )?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}