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

/** Refresh lebih awal supaya token tidak kedaluwarsa di tengah perjalanan request. */
const REFRESH_SKEW_MS = 60_000;

const REFRESH_TIMEOUT_MS = 10_000;

/**
 * Backend menghapus refresh token lama setiap kali dirotasi. Kalau beberapa
 * request bersamaan sama-sama memanggil /auth/refresh, hanya yang pertama
 * berhasil dan sisanya dapat 401 — user ter-logout padahal sesinya sehat.
 * Map ini membuat request kedua dst. menunggu promise yang sama.
 *
 * PENTING: berkas ini hanya boleh di-import oleh Route Handler. proxy.ts
 * memuat modul di instance terpisah, jadi kalau proxy ikut mengimpor akan
 * lahir Map kedua dan single-flight-nya bocor. Proxy mengakses ini lewat
 * HTTP ke /api/auth/refresh.
 */
const inFlight = new Map<string, Promise<TokenPair | null>>();

export type SessionState =
  | { status: "ok"; accessToken: string }
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

/**
 * Tukar refresh token jadi pasangan baru dan simpan ke cookie.
 * Mengembalikan null kalau refresh token sudah tidak sah — pemanggil
 * harus memperlakukan itu sebagai logout.
 */
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
    // Pemenang single-flight sudah menulis cookie; yang menunggu cukup
    // memakai hasilnya.
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

/**
 * Access token yang dijamin masih berlaku, menyegarkannya lebih dulu bila
 * perlu. Dipakai oleh proxy /api/app sebelum meneruskan request.
 */
export async function getValidAccessToken(): Promise<SessionState> {
  const jar = await cookies();
  const accessToken = jar.get(ACCESS_TOKEN_COOKIE)?.value;
  const remaining = accessTokenRemainingMs(
    jar.get(ACCESS_EXPIRES_COOKIE)?.value,
  );

  if (accessToken && remaining > REFRESH_SKEW_MS) {
    return { status: "ok", accessToken };
  }

  const pair = await refreshSession();

  if (pair) return { status: "ok", accessToken: pair.access_token };

  // Tidak ada refresh token, tapi access token masih ada — mis. sesi lama
  // dari sebelum fitur ini ada. Pakai apa adanya; backend yang memutuskan.
  if (accessToken && remaining > 0) {
    return { status: "ok", accessToken };
  }

  return { status: "expired" };
}
