import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("lumina_session")?.value;

  if (!token) {
    const login = new URL("/login", request.url);

    login.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );

    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/products/:path*"],
};
