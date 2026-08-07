"use server";

import { cookies, headers } from "next/headers";

import {
  ACCESS_EXPIRES_COOKIE,
  REFRESH_EXPIRES_COOKIE,
  clearSessionCookies,
  writeSessionCookies,
} from "@/lib/auth/session-cookies";
import type { LoginRequest, LoginServerResult } from "@/types/auth/auth.types";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

const LOGIN_TIMEOUT_MS = 15_000;

type LoginResponseBody = {
  title?: string | null;
  message?: string | null;
  errors?: Record<string, string[] | string> | null;
  data?: {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
    user?: { name?: string | null } | null;
  } | null;
};

export async function loginServerSide(
  credentials: LoginRequest,
): Promise<LoginServerResult> {
  const incoming = await headers();

  const outgoing = new Headers();
  outgoing.set("accept", "application/json");
  outgoing.set("content-type", "application/json");
  outgoing.set("x-client-type", "web");

  const userAgent = incoming.get("user-agent");
  if (userAgent) outgoing.set("user-agent", userAgent);

  const clientIp =
    incoming.get("cf-connecting-ip") ||
    incoming.get("x-real-ip") ||
    incoming.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) outgoing.set("x-client-ip", clientIp);

  let response: Response;
  try {
    response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: outgoing,
      body: JSON.stringify(credentials),
      cache: "no-store",
      signal: AbortSignal.timeout(LOGIN_TIMEOUT_MS),
    });
  } catch {
    return {
      ok: false,
      error: {
        status: 0,
        title: "Tidak dapat terhubung ke server",
        message:
          "Periksa koneksi internet Anda, lalu coba lagi. Jika masalah berlanjut, laporkan ke admin/developer terkait masalah ini.",
      },
    };
  }

  let body: LoginResponseBody | null = null;
  try {
    const text = await response.text();
    body = text ? (JSON.parse(text) as LoginResponseBody) : null;
  } catch {
    body = null;
  }

  if (!response.ok) {
    return {
      ok: false,
      error: {
        status: response.status,
        title: body?.title ?? null,
        message: body?.message ?? null,
        errors: body?.errors ?? null,
      },
    };
  }

  const data = body?.data;
  if (!data?.access_token || !data?.refresh_token) {
    return {
      ok: false,
      error: {
        status: 500,
        message: "Respons login tidak valid dari server.",
      },
    };
  }

  const cookieStore = await cookies();
  writeSessionCookies(cookieStore, {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
    refresh_expires_in: data.refresh_expires_in,
  });

  return { ok: true, user: { name: data.user?.name ?? null } };
}

export async function clearLoginSession() {
  const cookieStore = await cookies();
  clearSessionCookies(cookieStore);
}

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
