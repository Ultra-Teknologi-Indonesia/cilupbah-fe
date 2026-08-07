import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const guestRoutes = ["/login", "/register"];
const protectedRoutes = ["/dashboard", "/profile"];

const ACCESS_TOKEN_COOKIE = "token";
const REFRESH_TOKEN_COOKIE = "refresh_token";
const ACCESS_EXPIRES_COOKIE = "token_expires_at";
const REFRESH_EXPIRES_COOKIE = "refresh_expires_at";
const SESSION_COOKIES = [
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_EXPIRES_COOKIE,
  REFRESH_EXPIRES_COOKIE,
];

const REFRESH_SKEW_MS = 60_000;

function redirectToLogin(request: NextRequest, pathname: string) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", pathname);
  const res = NextResponse.redirect(loginUrl);
  for (const name of SESSION_COOKIES) {
    res.cookies.delete(name);
  }
  return res;
}

function timestamp(raw?: string): number | null {
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

type FunnelResult =
  | { status: "ok"; cookies: string[] }
  | { status: "retryable" }
  | { status: "dead" };

async function refreshViaFunnel(request: NextRequest): Promise<FunnelResult> {
  try {
    const res = await fetch(new URL("/api/auth/refresh", request.url), {
      method: "POST",
      headers: { cookie: request.headers.get("cookie") ?? "" },
      cache: "no-store",
    });

    if (res.ok) return { status: "ok", cookies: res.headers.getSetCookie() };

    if (res.status === 503) return { status: "retryable" };

    return { status: "dead" };
  } catch {
    return { status: "retryable" };
  }
}

function rewriteCookieHeader(original: string, setCookies: string[]): string {
  const fresh = new Map<string, string>();

  for (const raw of setCookies) {
    const [pair] = raw.split(";");
    const index = pair.indexOf("=");
    if (index <= 0) continue;
    const name = pair.slice(0, index).trim();
    if (!SESSION_COOKIES.includes(name)) continue;
    fresh.set(name, pair.slice(index + 1).trim());
  }

  if (fresh.size === 0) return original;

  const kept = original
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => {
      const name = part.slice(0, part.indexOf("=")).trim();
      return !fresh.has(name);
    });

  for (const [name, value] of fresh) {
    kept.push(`${name}=${value}`);
  }

  return kept.join("; ");
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  const isGuestRoute = guestRoutes.some((r) => pathname.startsWith(r));

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  const refreshExpiresAt = timestamp(
    request.cookies.get(REFRESH_EXPIRES_COOKIE)?.value,
  );
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const accessExpiresAt = timestamp(
    request.cookies.get(ACCESS_EXPIRES_COOKIE)?.value,
  );

  const hasLiveSession = refreshToken
    ? refreshExpiresAt === null || refreshExpiresAt > Date.now()
    : Boolean(accessToken);

  if (isProtectedRoute && !hasLiveSession) {
    return redirectToLogin(request, pathname);
  }

  if (isGuestRoute && hasLiveSession) {
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    // Hanya izinkan path relatif internal. Tolak protocol-relative ("//evil.com")
    // dan "/\evil.com" yang di-resolve new URL() menjadi origin eksternal.
    const dest =
      callbackUrl &&
      callbackUrl.startsWith("/") &&
      !callbackUrl.startsWith("//") &&
      !callbackUrl.startsWith("/\\")
        ? callbackUrl
        : "/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  const accessStale =
    accessExpiresAt === null || accessExpiresAt - Date.now() < REFRESH_SKEW_MS;

  if (isProtectedRoute && refreshToken && accessStale) {
    const refresh = await refreshViaFunnel(request);

    if (refresh.status === "dead") {
      return redirectToLogin(request, pathname);
    }

    if (refresh.status === "retryable") {
      return NextResponse.next();
    }

    const setCookies = refresh.cookies;
    const requestHeaders = new Headers(request.headers);
    const rewritten = rewriteCookieHeader(
      request.headers.get("cookie") ?? "",
      setCookies,
    );
    requestHeaders.set("cookie", rewritten);

    const res = NextResponse.next({ request: { headers: requestHeaders } });
    for (const cookie of setCookies) {
      res.headers.append("set-cookie", cookie);
    }
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
