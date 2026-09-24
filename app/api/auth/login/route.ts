import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { dummyApi } from "@/lib/axios";
import { sessionCookie, signSession, type SessionUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const username = String(body?.username || "").trim();
    const password = String(body?.password || "");

    if (!username || !password)
      return NextResponse.json(
        { message: "Username and password are required." },
        { status: 400 },
      );

    // Keep the assignment's required DummyJSON demo credentials working exactly as requested.
    if (username.toLowerCase() === "emilys") {
      try {
        const { data } = await dummyApi.post("/auth/login", {
          username,
          password,
          expiresInMins: 60,
        });
        const user: SessionUser = {
          id: String(data.id),
          username: data.username,
          firstName: data.firstName || "Emily",
          lastName: data.lastName || "Johnson",
          email: data.email,
          role: "admin",
          provider: "dummyjson",
        };
        const response = NextResponse.json({
          user,
          accessToken: data.accessToken || data.token,
        });
        response.cookies.set(sessionCookie(signSession(user)));
        return response;
      } catch {
        return NextResponse.json(
          { message: "Invalid username or password." },
          { status: 401 },
        );
      }
    }

    await connectMongo();
    const userRecord = await User.findOne({ username: username.toLowerCase() })
      .select("+passwordHash")
      .lean();
    if (
      !userRecord ||
      !(await bcrypt.compare(password, userRecord.passwordHash))
    ) {
      return NextResponse.json(
        { message: "Invalid username or password." },
        { status: 401 },
      );
    }

    const user: SessionUser = {
      id: String(userRecord._id),
      username: userRecord.username,
      firstName: userRecord.firstName,
      lastName: userRecord.lastName,
      email: userRecord.email,
      role: userRecord.role as "admin" | "user",
      provider: "mongodb",
    };
    const response = NextResponse.json({ user });
    response.cookies.set(sessionCookie(signSession(user)));
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Unable to sign in." },
      { status: 500 },
    );
  }
}
