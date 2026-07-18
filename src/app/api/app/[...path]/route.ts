import { NextRequest, NextResponse } from "next/server";

import { getValidAccessToken, refreshSession } from "@/lib/auth/token-refresh";

const BACKEND_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:8000";

function sessionExpiredResponse() {
  return NextResponse.json(
    { code: "SESSION_EXPIRED", message: "Sesi Anda telah berakhir." },
    { status: 401 },
  );
}

async function proxyRequest(
  request: NextRequest,
  { params: _params }: { params: Promise<{ path: string[] }> },
) {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/api\/app\//, "/api/v1/");
  const targetUrl = `${BACKEND_URL}${targetPath}${url.search}`;

  const headers = new Headers();
  headers.set("accept", "application/json");
  headers.set("x-client-type", "web");

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

  const session = await getValidAccessToken();

  if (session.status === "expired") {
    return sessionExpiredResponse();
  }

  // status "anonymous" tetap diteruskan tanpa Authorization — endpoint
  // publik seperti /auth/login dan /auth/forgot-password lewat sini juga.
  if (session.status === "ok") {
    headers.set("authorization", `Bearer ${session.accessToken}`);
  }

  const hasBody = request.method !== "GET" && request.method !== "HEAD";
  // Body dibuffer supaya request bisa diulang setelah refresh — stream
  // hanya bisa dibaca sekali.
  const body = hasBody ? await request.arrayBuffer() : undefined;

  try {
    let response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
    });

    // Jaring pengaman: token ditolak walaupun menurut cookie masih berlaku
    // (mis. sesi dicabut admin, atau selisih jam server). Coba segarkan
    // sekali lalu ulangi request yang sama.
    //
    // Hanya untuk request yang memang membawa sesi. Tanpa penjagaan ini,
    // login dengan password salah — yang juga membalas 401 — akan diubah
    // jadi SESSION_EXPIRED dan pesan aslinya tertelan redirect ke /login.
    if (response.status === 401 && session.status === "ok") {
      const pair = await refreshSession();

      if (!pair) {
        return sessionExpiredResponse();
      }

      headers.set("authorization", `Bearer ${pair.access_token}`);
      response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
      });

      if (response.status === 401) {
        return sessionExpiredResponse();
      }
    }

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
