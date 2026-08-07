import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Runtime image GHCR cuma butuh .next/standalone + .next/static (bukan
  // seluruh node_modules) — lihat Dockerfile stage `runner`.
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  compiler: {
    // Buang console.* dari bundle produksi (kecuali console.error) — kurangi
    // ukuran JS & overhead runtime di klien; log debug tetap ada saat dev.
    removeConsole:
      process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    inlineCss: true,
    // Tree-shake barrel import ikon lucide-react agar hanya ikon yang dipakai
    // yang masuk bundle (proyek ini mengimpor ikon di ratusan file).
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    // Security header dasar (defense-in-depth). CSP penuh belum dipasang di
    // sini karena butuh setup nonce + pengujian — itu bagian dari perbaikan
    // sanitasi XSS deskripsi produk, bukan header statis.
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/dashboard/manajemen-rak/lokasi/:path*",
        destination: "/dashboard/lokasi/:path*",
        permanent: true,
      },
      {
        source: "/dashboard/manajemen-rak",
        destination: "/dashboard/lokasi",
        permanent: true,
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  telemetry: false,
});
