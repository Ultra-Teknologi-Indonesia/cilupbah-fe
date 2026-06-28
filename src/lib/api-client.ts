export interface FetchClientOptions extends Omit<RequestInit, 'body'> {
  data?: any;
  params?: Record<string, any>;
}

export async function fetchClient<T>(
  endpoint: string,
  options?: FetchClientOptions
): Promise<T> {
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  let url = `/api/app${formattedEndpoint}`;
  if (options?.params) {
    const sp = new URLSearchParams();
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        sp.append(key, String(value));
      }
    });
    const qs = sp.toString();
    if (qs) {
      url += (url.includes('?') ? '&' : '?') + qs;
    }
  }

  const fetchOptions: RequestInit = {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  };

  if (options?.data !== undefined) {
    if (options.data instanceof FormData) {
      // Let browser set the multipart/form-data boundary automatically
      const headers = new Headers(fetchOptions.headers as any);
      headers.delete("Content-Type");
      headers.delete("content-type");
      
      const headersObj: Record<string, string> = {};
      headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      fetchOptions.headers = headersObj;
      
      fetchOptions.body = options.data;
    } else {
      fetchOptions.body = JSON.stringify(options.data);
    }
  }
  
  delete (fetchOptions as any).data;
  delete (fetchOptions as any).params;

  const response = await fetch(url, fetchOptions);
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw data;
  }

  return data as T;
}

export async function fetchBlob(
  endpoint: string,
  filename: string,
  mimeType?: string
): Promise<void> {
  const formattedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `/api/app${formattedEndpoint}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "*/*" },
  });

  if (!response.ok) {
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    throw data;
  }

  const blob = mimeType
    ? new Blob([await response.arrayBuffer()], { type: mimeType })
    : await response.blob();

  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}
