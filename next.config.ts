import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Versi aplikasi yang ditampilkan di UI. Prioritas:
// 1) build-arg NEXT_PUBLIC_APP_VERSION (di-set CI dari tag rilis; .git tidak
//    ikut ke image Docker jadi git describe tidak jalan di sana),
// 2) tag Git terakhir untuk build lokal,
// 3) fallback ke version di package.json.
function resolveAppVersion(): string {
  if (process.env.NEXT_PUBLIC_APP_VERSION) {
    return process.env.NEXT_PUBLIC_APP_VERSION;
  }
  try {
    return execSync("git describe --tags --abbrev=0", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    try {
      const pkg = JSON.parse(readFileSync("./package.json", "utf8"));
      return `v${pkg.version}`;
    } catch {
      return "dev";
    }
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: resolveAppVersion(),
  },
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
