import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const guestRoutes = ["/login", "/register"];
const protectedRoutes = ["/dashboard", "/profile"];


async function isTokenValid(token: string): Promise<boolean> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  try {
    const res = await fetch(`${base}/api/v1/profile`, {
      headers: { authorization: `Bearer ${token}`, accept: "application/json" },
      cache: "no-store",
    });
    if (res.status === 401) return false;
    return true; 
  } catch {
    return true; 
  }
}

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.delete("token");
  return res;
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  const isGuestRoute = guestRoutes.some((r) => pathname.startsWith(r));

  if (isProtectedRoute) {
    if (!token) return redirectToLogin(request, pathname);
    if (!(await isTokenValid(token))) return redirectToLogin(request, pathname);
  }

  if (isGuestRoute && token) {
    
    if (await isTokenValid(token)) {
      const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
      const dest =
        callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
    
    const res = NextResponse.next();
    res.cookies.delete("token");
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
