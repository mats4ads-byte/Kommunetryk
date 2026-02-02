import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isProtected = url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/org") || url.pathname.startsWith("/supplier");
  if (!isProtected) return NextResponse.next();

  const session = req.cookies.get("kglp_session")?.value;
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("next", url.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/org/:path*", "/supplier/:path*"],
};
