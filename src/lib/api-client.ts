import axios, { AxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: "/api/app",
  headers: {
    "Content-Type": "application/json",
  },
});

export async function fetchClient<T>(
  endpoint: string,
  options?: AxiosRequestConfig
): Promise<T> {
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
