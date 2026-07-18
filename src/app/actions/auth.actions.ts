"use server";

import { cookies } from "next/headers";

import {
  ACCESS_EXPIRES_COOKIE,
  REFRESH_EXPIRES_COOKIE,
  clearSessionCookies,
  writeSessionCookies,
  type TokenPair,
} from "@/lib/auth/session-cookies";

export async function setLoginSession(pair: TokenPair) {
  const cookieStore = await cookies();
  writeSessionCookies(cookieStore, pair);
}

export async function clearLoginSession() {
  const cookieStore = await cookies();
  clearSessionCookies(cookieStore);
}

/**
 * Penanda kedaluwarsa untuk klien. Bukan rahasia — hanya angka waktu —
 * dan dipakai idle lock serta penjadwal refresh proaktif.
 */
export async function readSessionMeta(): Promise<{
  accessExpiresAt: number | null;
  refreshExpiresAt: number | null;
}> {
  const cookieStore = await cookies();
  const parse = (raw?: string) => {
    const value = Number(raw);
    return Number.isFinite(value) && value > 0 ? value : null;
  };

  return {
    accessExpiresAt: parse(cookieStore.get(ACCESS_EXPIRES_COOKIE)?.value),
    refreshExpiresAt: parse(cookieStore.get(REFRESH_EXPIRES_COOKIE)?.value),
  };
}
