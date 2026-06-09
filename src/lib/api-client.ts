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
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
}
