import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;
  const isPublicAuth = ["/login", "/forgot-password", "/reset-password"].includes(request.nextUrl.pathname);

  if (!token && !isPublicAuth) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/employees/:path*", "/attendance/:path*", "/leaves/:path*", "/payroll/:path*", "/salary-advance/:path*", "/profile/:path*", "/login", "/forgot-password", "/reset-password"],
};
