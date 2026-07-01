import "server-only";

import { cookies } from "next/headers";
import type { AxiosRequestConfig } from "axios";
import { QueryClient } from "@tanstack/react-query";

import { setServerFetcher } from "./api-client";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Transport server: meniru route proxy (/api/app/* → BACKEND/api/v1/*) tapi
// dipanggil langsung dari Server Component untuk prefetch. Auth via cookie
// token, dibaca per-request (cache: "no-store") agar data per-user tidak bocor
// lintas request.
async function serverFetch<T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<T> {
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const store = await cookies();
  const token = store.get("token")?.value || store.get("session")?.value;

  const method = (options?.method ?? "GET").toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD" && options?.data != null;

  const res = await fetch(`${BACKEND_URL}/api/v1${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? JSON.stringify(options?.data) : undefined,
    cache: "no-store",
    // Batasi waktu tunggu prefetch: bila backend lambat/hang, biarkan gagal →
    // prefetchQuery menelan error, query tak ter-dehydrate, dan klien fetch
    // seperti biasa. Mencegah render SSR menggantung tanpa batas.
    signal: AbortSignal.timeout(5000),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    // Selaras dengan fetchClient: lempar body error agar shape error konsisten.
    throw data ?? { message: res.statusText };
  }
  return data as T;
}

// Aktifkan transport server begitu modul ini masuk graph (server-only).
setServerFetcher(serverFetch);

/**
 * QueryClient sekali-pakai per request untuk prefetch di Server Component.
 * Memanggil fungsi ini juga menjamin efek `setServerFetcher` di atas tidak
 * ter-tree-shake, sehingga service (yang memakai fetchClient) benar-benar
 * dialihkan ke transport server saat prefetch.
 */
export function getServerQueryClient(): QueryClient {
  return new QueryClient();
}
