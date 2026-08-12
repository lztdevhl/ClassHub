import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";

export function decideAuthRedirect({ pathname, hasCookie }: { pathname: string; hasCookie: boolean }): string | null {
  if (pathname === "/login") {
    return null;
  }

  return hasCookie ? null : "/login";
}

export function proxy(request: NextRequest) {
  const destination = decideAuthRedirect({
    pathname: request.nextUrl.pathname,
    hasCookie: request.cookies.has(SESSION_COOKIE_NAME),
  });

  return destination ? NextResponse.redirect(new URL(destination, request.url)) : NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|robots.txt|sitemap.xml|manifest.webmanifest).*)"],
};
