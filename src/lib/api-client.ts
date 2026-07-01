import axios, { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: "/api/app",
  headers: {
    "Content-Type": "application/json",
  },
});

// Transport override untuk lingkungan server (RSC prefetch). Axios di sini
// pakai baseURL relatif "/api/app" yang tidak valid di server, jadi saat
// prefetch di Server Component kita alihkan ke fetcher server (lihat
// api-server.ts) yang memanggil backend langsung + auth cookie. Global di
// server aman: fetchClient praktis tak pernah dipanggil lewat axios di server.
type ServerFetcher = <T>(
  endpoint: string,
  options?: AxiosRequestConfig
) => Promise<T>;
let serverFetcher: ServerFetcher | null = null;
export function setServerFetcher(fetcher: ServerFetcher | null): void {
  serverFetcher = fetcher;
}

export async function fetchClient<T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<T> {
  if (serverFetcher) {
    return serverFetcher<T>(endpoint, options);
  }

  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  try {
    const response = await apiClient(formattedEndpoint, options);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
}

export async function fetchBlob(
  endpoint: string,
  filename: string,
  mimeType?: string
): Promise<void> {
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await apiClient(formattedEndpoint, {
    responseType: "blob",
    headers: { Accept: "*/*" },
  });

  const blob = mimeType
    ? new Blob([response.data], { type: mimeType })
    : response.data;

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function fetchBlobRaw(
  endpoint: string,
  mimeType?: string
): Promise<Blob> {
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await apiClient(formattedEndpoint, {
    responseType: "blob",
    headers: { Accept: "*/*" },
  });

  return mimeType
    ? new Blob([response.data], { type: mimeType })
    : response.data;
}
