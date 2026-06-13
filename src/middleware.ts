import { auth } from "./auth.config";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = nextUrl.pathname.startsWith("/api/public");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");

  if (isApiAuthRoute) return NextResponse.next();

  if (nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // RBAC for Admin
  if (nextUrl.pathname.startsWith("/admin")) {
    const role = (req.auth?.user as any)?.role;
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
