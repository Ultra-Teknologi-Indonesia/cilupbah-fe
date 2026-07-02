import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const guestRoutes = ["/login", "/register"];
const protectedRoutes = ["/dashboard", "/profile"];

// Middleware sengaja TIDAK memvalidasi token ke backend. Sebelumnya setiap
// navigasi (termasuk prefetch <Link> — sidebar punya 34 link) menunggu fetch
// blocking ke /api/v1/profile, yang membuat navigasi lambat dan menimbulkan
// fetch storm ke backend. Token opaque tidak bisa diverifikasi lokal, jadi
// sumber kebenaran auth adalah respons 401 dari proxy /api/app/* — ditangani
// interceptor di lib/api-client.ts yang menghapus sesi lalu redirect ke login.

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  const res = NextResponse.redirect(loginUrl);
  res.cookies.delete("token");
  return res;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  const isGuestRoute = guestRoutes.some((r) => pathname.startsWith(r));

  if (isProtectedRoute && !token) {
    return redirectToLogin(request, pathname);
  }

  if (isGuestRoute && token) {
    // Token kedaluwarsa akan ter-401 di dashboard lalu dibersihkan oleh
    // interceptor, sehingga tidak terjadi redirect loop.
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const dest =
      callbackUrl && callbackUrl.startsWith("/") ? callbackUrl : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
