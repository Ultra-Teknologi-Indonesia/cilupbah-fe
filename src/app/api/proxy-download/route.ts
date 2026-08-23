import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { lookup } from "node:dns/promises";
import net from "node:net";

import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session-cookies";

const MAX_REDIRECTS = 3;
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB — batas wajar untuk resi/label/gambar produk.

/** Tipe konten "aktif" yang bisa dirender same-origin — dinetralkan jadi unduhan biner. */
const ACTIVE_CONTENT_TYPES = [
  "text/html",
  "application/xhtml+xml",
  "image/svg+xml",
  "application/xml",
  "text/xml",
];

/** Nama file unduhan dari path URL, di-sanitasi; fallback "download". */
function downloadFilename(rawUrl: string): string {
  try {
    const base = new URL(rawUrl).pathname.split("/").pop() || "";
    const clean = base.replace(/[^\w.\-]/g, "_").slice(0, 128);
    return clean || "download";
  } catch {
    return "download";
  }
}

/** IP internal/privat/loopback/link-local/metadata yang tak boleh dijangkau. */
function isBlockedIp(ip: string): boolean {
  let addr = ip.toLowerCase();
  // IPv4-mapped IPv6 (::ffff:10.0.0.1) → periksa bagian IPv4-nya.
  if (addr.startsWith("::ffff:") && net.isIPv4(addr.slice(7)))
    addr = addr.slice(7);

  if (net.isIPv4(addr)) {
    const [a, b] = addr.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 169 && b === 254) || // link-local + 169.254.169.254 (cloud metadata)
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) // CGNAT
    );
  }
  return (
    addr === "::" ||
    addr === "::1" ||
    addr.startsWith("fc") ||
    addr.startsWith("fd") || // ULA
    addr.startsWith("fe80") // link-local
  );
}

/** Tolak non-HTTPS dan host yang menunjuk (termasuk via DNS) ke IP internal. */
async function assertSafeUrl(target: URL): Promise<void> {
  if (target.protocol !== "https:") {
    throw new Response("Only HTTPS URLs allowed", { status: 400 });
  }
  const host = target.hostname;
  if (net.isIP(host)) {
    if (isBlockedIp(host)) throw new Response("Blocked host", { status: 400 });
    return;
  }
  const resolved = await lookup(host, { all: true });
  if (resolved.length === 0 || resolved.some((r) => isBlockedIp(r.address))) {
    throw new Response("Blocked host", { status: 400 });
  }
}

/** Fetch dengan validasi SSRF di SETIAP hop redirect (menutup bypass via 3xx). */
async function safeFetch(startUrl: string): Promise<Response> {
  let current = startUrl;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertSafeUrl(new URL(current));
    const res = await fetch(current, { redirect: "manual" });
    const loc = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && loc) {
      current = new URL(loc, current).toString();
      continue;
    }
    return res;
  }
  throw new Response("Too many redirects", { status: 400 });
}

export async function GET(request: NextRequest) {
  // Route ini di bawah /api sehingga dilewati middleware auth — jaga di sini:
  // hanya sesi terautentikasi yang boleh memakai proxy (cegah SSRF anonim).
  const cookieStore = await cookies();
  if (!cookieStore.get(ACCESS_TOKEN_COOKIE)?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json(
      { error: "Missing url parameter" },
      { status: 400 },
    );
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  try {
    const response = await safeFetch(url);
    if (!response.ok) {
      return new NextResponse(null, {
        status: response.status,
        statusText: response.statusText,
      });
    }

    const cl = response.headers.get("content-length");
    if (cl && Number(cl) > MAX_BYTES) {
      return NextResponse.json(
        { error: "Resource too large" },
        { status: 413 },
      );
    }

    const headers = new Headers();

    // Content-type upstream diteruskan, KECUALI tipe aktif yang bisa dirender
    // same-origin (HTML/SVG/XML) — dipaksa biner agar tak dieksekusi di origin app.
    const ct = (response.headers.get("content-type") || "").toLowerCase();
    const isActive = ACTIVE_CONTENT_TYPES.some((t) => ct.startsWith(t));
    headers.set(
      "content-type",
      !ct || isActive ? "application/octet-stream" : ct,
    );

    // Selalu paksa unduhan (bukan render inline) — ini proxy download, dan
    // disposition upstream tak boleh menentukan cara browser memperlakukan body.
    headers.set(
      "content-disposition",
      `attachment; filename="${downloadFilename(url)}"`,
    );
    headers.set("x-content-type-options", "nosniff");
    if (cl) headers.set("content-length", cl);

    return new NextResponse(response.body, { status: 200, headers });
  } catch (error) {
    // assertSafeUrl melempar Response (host diblokir / non-https).
    if (error instanceof Response) return error;
    const message = error instanceof Error ? error.message : String(error);
    console.error("Proxy download error:", url, message);
    return NextResponse.json(
      { error: "Failed to fetch resource" },
      { status: 502 },
    );
  }
}
