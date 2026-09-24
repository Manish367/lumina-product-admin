import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectMongo } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { validateRegistration } from "@/lib/validation";
import { sessionCookie, signSession, type SessionUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const result = validateRegistration(await request.json());
    if (!result.valid)
      return NextResponse.json(
        {
          message: "Please correct the highlighted fields.",
          errors: result.errors,
        },
        { status: 400 },
      );
    if (result.value.username === "emilys")
      return NextResponse.json(
        { message: "That username is reserved for the required demo account." },
        { status: 409 },
      );

    await connectMongo();
    const exists = await User.findOne({
      $or: [{ username: result.value.username }, { email: result.value.email }],
    }).lean();
    if (exists)
      return NextResponse.json(
        { message: "Username or email is already registered." },
        { status: 409 },
      );

    const passwordHash = await bcrypt.hash(result.value.password, 12);
    const created = await User.create({ ...result.value, passwordHash });
    const user: SessionUser = {
      id: String(created._id),
      username: created.username,
      firstName: created.firstName,
      lastName: created.lastName,
      email: created.email,
      role: "user",
      provider: "mongodb",
    };
    const response = NextResponse.json({ user }, { status: 201 });
    response.cookies.set(sessionCookie(signSession(user)));
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        message:
          error?.code === 11000
            ? "Username or email is already registered."
            : error?.message || "Unable to create account.",
      },
      { status: error?.code === 11000 ? 409 : 500 },
    );
  }
}
