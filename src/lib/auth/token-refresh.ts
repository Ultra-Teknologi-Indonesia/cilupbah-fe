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

const RETRY_BACKOFF_MS = 400;

const inFlight = new Map<string, Promise<PairResult>>();

export type SessionState =
  | { status: "ok"; accessToken: string }
  | { status: "anonymous" }
  | { status: "expired" }
  | { status: "unavailable" };

export type RefreshResult =
  | { status: "ok"; pair: TokenPair }
  | { status: "dead" }
  | { status: "retryable" };

type PairResult =
  | { status: "ok"; pair: TokenPair }
  | { status: "dead" }
  | { status: "retryable" };

async function attemptRefresh(refreshToken: string): Promise<PairResult> {
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

    if (res.status === 401) return { status: "dead" };

    if (!res.ok) return { status: "retryable" };

    const body = await res.json();
    const data = body?.data;

    if (!data?.access_token || !data?.refresh_token) {
      return { status: "retryable" };
    }

    return {
      status: "ok",
      pair: {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        refresh_expires_in: data.refresh_expires_in,
      },
    };
  } catch {
    return { status: "retryable" };
  }
}

async function requestNewPair(refreshToken: string): Promise<PairResult> {
  const first = await attemptRefresh(refreshToken);
  if (first.status !== "retryable") return first;

  await new Promise((resolve) => setTimeout(resolve, RETRY_BACKOFF_MS));
  return attemptRefresh(refreshToken);
}

export async function refreshSession(): Promise<RefreshResult> {
  const jar = await cookies();
  const refreshToken = jar.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!refreshToken) return { status: "dead" };

  if (!refreshWindowOpen(jar.get(REFRESH_EXPIRES_COOKIE)?.value)) {
    clearSessionCookies(jar);
    return { status: "dead" };
  }

  const existing = inFlight.get(refreshToken);
  const attempt =
    existing ??
    requestNewPair(refreshToken).finally(() => {
      inFlight.delete(refreshToken);
    });
  if (!existing) inFlight.set(refreshToken, attempt);

  const result = await attempt;

  if (result.status === "ok") {
    writeSessionCookies(jar, result.pair);
    return { status: "ok", pair: result.pair };
  }

  if (result.status === "dead") {
    clearSessionCookies(jar);
    return { status: "dead" };
  }

  return { status: "retryable" };
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

  const result = await refreshSession();

  if (result.status === "ok") {
    return { status: "ok", accessToken: result.pair.access_token };
  }

  if (result.status === "retryable") {
    if (accessToken) return { status: "ok", accessToken };
    return { status: "unavailable" };
  }

  if (accessToken && !refreshToken) {
    return { status: "ok", accessToken };
  }

  return { status: "expired" };
}
