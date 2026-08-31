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
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const payload =
      data && typeof data === "object"
        ? { ...(data as Record<string, unknown>) }
        : {
            title:
              res.status === 503
                ? "Layanan sementara tidak tersedia"
                : "Terjadi kesalahan server",
            message:
              res.status === 503
                ? "Server sedang padat. Silakan coba lagi beberapa saat."
                : "Silakan coba lagi. Jika masalah berlanjut, laporkan ke admin/developer terkait masalah ini.",
          };

    throw { ...payload, status: res.status };
  }
  return data as T;
}

setServerFetcher(serverFetch);

export function getServerQueryClient(): QueryClient {
  return new QueryClient();
}
