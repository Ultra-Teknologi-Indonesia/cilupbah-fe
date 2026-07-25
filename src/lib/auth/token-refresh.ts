import { cookies } from "next/headers";

import {
  ACCESS_EXPIRES_COOKIE,
  ACCESS_TOKEN_COOKIE,
  REFRESH_EXPIRES_COOKIE,
  REFRESH_TOKEN_COOKIE,
  accessTokenRemainingMs,
  clearSessionCookies,
  refreshWindowOpen,
  writeSessionCookies,
  type TokenPair,
} from "@/lib/auth/session-cookies";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const REFRESH_SKEW_MS = 60_000;

const REFRESH_TIMEOUT_MS = 10_000;

const inFlight = new Map<string, Promise<TokenPair | null>>();

export type SessionState =

  | { status: "ok"; accessToken: string }

  | { status: "anonymous" }

  | { status: "expired" };

async function requestNewPair(refreshToken: string): Promise<TokenPair | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${refreshToken}`,
        "x-client-type": "web",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REFRESH_TIMEOUT_MS),
    });

    if (!res.ok) return null;

    const body = await res.json();
    const data = body?.data;

    if (!data?.access_token || !data?.refresh_token) return null;

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      refresh_expires_in: data.refresh_expires_in,
    };
  } catch {
    return null;
  }
}

export async function refreshSession(): Promise<TokenPair | null> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) return null;

  if (!refreshWindowOpen(jar.get(REFRESH_EXPIRES_COOKIE)?.value)) {
    clearSessionCookies(jar);
    return null;
  }

  const existing = inFlight.get(refreshToken);
  if (existing) {
    const pair = await existing;

    return pair;
  }

  const attempt = requestNewPair(refreshToken).finally(() => {
    inFlight.delete(refreshToken);
  });
  inFlight.set(refreshToken, attempt);

  const pair = await attempt;

  if (!pair) {
    clearSessionCookies(jar);
    return null;
  }

  writeSessionCookies(jar, pair);
  return pair;
}

export async function getValidAccessToken(): Promise<SessionState> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken && !refreshToken) {
    return { status: "anonymous" };
  }

  const remaining = accessTokenRemainingMs(
    jar.get(ACCESS_EXPIRES_COOKIE)?.value,
  );

  if (accessToken && remaining > REFRESH_SKEW_MS) {
    return { status: "ok", accessToken };
  }

  const pair = await refreshSession();

  if (pair) return { status: "ok", accessToken: pair.access_token };

  if (accessToken && !refreshToken) {
    return { status: "ok", accessToken };
  }

  return { status: "expired" };
}
