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

    const textData = await response.text();
    let jsonData;

    try {
      jsonData = JSON.parse(textData);
    } catch {
      jsonData = textData;
    }

    if (!response.ok) {
      return NextResponse.json(jsonData, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    return NextResponse.json(jsonData, {
      status: response.status,
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
