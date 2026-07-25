import axios, { AxiosRequestConfig } from "axios";
import { clearLoginSession } from "@/app/actions/auth.actions";

const apiClient = axios.create({
  baseURL: "/api/app",
  headers: {
    "Content-Type": "application/json",
    "X-Client-Type": "web",
  },
});

let sessionExpiredHandled = false;
apiClient.interceptors.response.use(undefined, async (error) => {

  const isSessionExpired =
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    (error.response?.data as { code?: string } | undefined)?.code ===
      "SESSION_EXPIRED";

  if (
    typeof window !== "undefined" &&
    isSessionExpired &&
    !window.location.pathname.startsWith("/login") &&
    !sessionExpiredHandled
  ) {
    sessionExpiredHandled = true;
    try {
      await clearLoginSession();
    } catch {}
    const callbackUrl = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/login?callbackUrl=${callbackUrl}`;
  }
  return Promise.reject(error);
});

type ServerFetcher = <T>(
  endpoint: string,
  options?: AxiosRequestConfig,
) => Promise<T>;
let serverFetcher: ServerFetcher | null = null;
export function setServerFetcher(fetcher: ServerFetcher | null): void {
  serverFetcher = fetcher;
}

export async function fetchClient<T>(
  endpoint: string,
  options?: AxiosRequestConfig,
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
      const body = error.response.data;
      const payload =
        body && typeof body === "object" ? { ...body } : { message: body };
      throw { status: error.response.status, ...payload };
    }
    if (axios.isAxiosError(error)) {
      throw {
        status: 0,
        title: "Tidak dapat terhubung ke server",
        message:
          "Periksa koneksi internet Anda, lalu coba lagi. Jika masalah berlanjut, laporkan ke admin/developer terkait masalah ini.",
      };
    }
    throw error;
  }
}

export async function fetchBlob(
  endpoint: string,
  filename: string,
  mimeType?: string,
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
  mimeType?: string,
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

export async function fetchBlobPost(
  endpoint: string,
  data: unknown,
  mimeType?: string,
): Promise<Blob> {
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const response = await apiClient(formattedEndpoint, {
    method: "POST",
    data,
    responseType: "blob",
    headers: { Accept: "*/*" },
  });

  return mimeType
    ? new Blob([response.data], { type: mimeType })
    : response.data;
}
