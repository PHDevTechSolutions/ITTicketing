import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dsi-login") || pathname.startsWith("/dsi-signup") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("refID");
  if (!token) return NextResponse.redirect(new URL("/dsi-login", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dsi-main/:path*",
    "/dashboard/:path*",
    "/tickets/:path*",
    "/concern/:path*",
    "/departments/:path*",
    "/request-types/:path*",
    "/modes/:path*",
    "/groups/:path*",
    "/sites/:path*",
    "/priorities/:path*",
    "/status/:path*",
    "/technicians/:path*",
  ],
};
