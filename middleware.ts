import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  const { pathname } = req.nextUrl;

  // if (pathname.startsWith("/admin") && !token) {
  //   return NextResponse.redirect(new URL("/", req.url));
  // }

  // if (pathname === "/" && token) {
  //   return NextResponse.redirect(new URL("/admin", req.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*"], 
};
