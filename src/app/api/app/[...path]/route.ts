import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/api\/app\//, "/api/v1/");
  const targetUrl = `${BACKEND_URL}${targetPath}${url.search}`;

  const headers = new Headers();
  headers.set("accept", "application/json");

  const contentType = request.headers.get("content-type");
  if (contentType) {
    headers.set("content-type", contentType);
  }

  const userAgent = request.headers.get("user-agent");
  if (userAgent) {
    headers.set("user-agent", userAgent);
  }

  const clientIp =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (clientIp) {
    headers.set("x-client-ip", clientIp);
  }

  const cookieStore = await cookies();
  const token =
    cookieStore.get("token")?.value || cookieStore.get("session")?.value;

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const fetchOptions: RequestInit = {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
  };

  try {
    const response = await fetch(targetUrl, fetchOptions);

    // Stream semua respons apa adanya — JSON maupun biner. Sebelumnya respons
    // JSON di-buffer penuh (response.text() → JSON.parse → re-serialize), yang
    // menambah latensi + memori untuk list besar dan mematikan streaming.
    // Membaca .text() juga merusak payload biner (mis. .xlsx). Passthrough
    // langsung dari response.body menjaga byte tetap utuh beserta status &
    // header; error body (non-2xx) tetap diteruskan dengan status aslinya
    // sehingga axios di client tetap menerima error.response.data seperti biasa.
    const passthroughHeaders = new Headers();
    for (const header of [
      "content-type",
      "content-disposition",
      "content-length",
      "cache-control",
    ]) {
      const value = response.headers.get(header);
      if (value) passthroughHeaders.set(header, value);
    }

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: passthroughHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("API Proxy Error:", targetUrl, message);

    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
