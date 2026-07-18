import "server-only";

import { cookies } from "next/headers";
import type { AxiosRequestConfig } from "axios";
import { QueryClient } from "@tanstack/react-query";

import { setServerFetcher } from "./api-client";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

async function serverFetch<T>(
  endpoint: string,
  options?: AxiosRequestConfig,
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const store = await cookies();
  // Sengaja TIDAK menyegarkan token di sini. Next melarang menulis cookie
  // saat render Server Component, jadi pasangan token hasil rotasi tidak
  // bisa disimpan — dan karena backend menghapus refresh token lama saat
  // rotasi, token barunya akan hilang dan user justru ter-logout.
  // proxy.ts sudah menyegarkan cookie sebelum render ini dimulai.
  const token = store.get("token")?.value || store.get("session")?.value;

  const method = (options?.method ?? "GET").toUpperCase();
  const hasBody =
    method !== "GET" && method !== "HEAD" && options?.data != null;

  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? JSON.stringify(options?.data) : undefined,
    cache: "no-store",

    signal: AbortSignal.timeout(10000),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw data ?? { message: res.statusText };
  }
  return data as T;
}

setServerFetcher(serverFetch);

export function getServerQueryClient(): QueryClient {
  return new QueryClient();
}
