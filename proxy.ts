import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret });

  const { pathname } = request.nextUrl;

  const isAdminPath = pathname.startsWith("/admin-panel");
  const isAuthorPath = pathname.startsWith("/author-panel");

  if ((isAdminPath || isAuthorPath) && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", "/");
    return NextResponse.redirect(loginUrl);
  }

  if (token) {
    if (isAdminPath && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/author-panel", request.url));
    }
    if (isAuthorPath && token.role !== "AUTHOR") {
      return NextResponse.redirect(new URL("/admin-panel", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-panel/:path*", "/author-panel/:path*"],
};