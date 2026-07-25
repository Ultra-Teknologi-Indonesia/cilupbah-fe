import type { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import type { cookies } from "next/headers";

export const ACCESS_TOKEN_COOKIE = "token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const ACCESS_EXPIRES_COOKIE = "token_expires_at";
export const REFRESH_EXPIRES_COOKIE = "refresh_expires_at";

export const SESSION_COOKIES = [
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_EXPIRES_COOKIE,
  REFRESH_EXPIRES_COOKIE,
] as const;

const COOKIE_MAX_AGE_FALLBACK = 60 * 60 * 24 * 30;

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  refresh_expires_in?: number;
};

type CookieJar = Awaited<ReturnType<typeof cookies>> | ResponseCookies;

function baseOptions(maxAge: number) {
  return {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function writeSessionCookies(jar: CookieJar, pair: TokenPair): void {
  const now = Date.now();
  const accessTtl = pair.expires_in ?? 3600;
  const refreshTtl = pair.refresh_expires_in ?? COOKIE_MAX_AGE_FALLBACK;

  jar.set(ACCESS_TOKEN_COOKIE, pair.access_token, {
    ...baseOptions(refreshTtl),
    httpOnly: true,
  });
  jar.set(REFRESH_TOKEN_COOKIE, pair.refresh_token, {
    ...baseOptions(refreshTtl),
    httpOnly: true,
  });
  jar.set(ACCESS_EXPIRES_COOKIE, String(now + accessTtl * 1000), {
    ...baseOptions(refreshTtl),
    httpOnly: false,
  });
  jar.set(REFRESH_EXPIRES_COOKIE, String(now + refreshTtl * 1000), {
    ...baseOptions(refreshTtl),
    httpOnly: false,
  });
}

export function clearSessionCookies(jar: CookieJar): void {
  for (const name of SESSION_COOKIES) {
    jar.delete(name);
  }
}

export function accessTokenRemainingMs(expiresAtRaw?: string): number {
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return -1;
  return expiresAt - Date.now();
}

export function refreshWindowOpen(expiresAtRaw?: string): boolean {
  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt <= 0) return false;
  return expiresAt > Date.now();
}
