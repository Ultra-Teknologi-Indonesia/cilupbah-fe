import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const guestRoutes = ['/login', '/register'];

const protectedRoutes = ['/dashboard', '/profile'];

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  
  const isGuestRoute = guestRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isGuestRoute && token) {
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const dest = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
