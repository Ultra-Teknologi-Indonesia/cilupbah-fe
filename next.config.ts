import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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

export default nextConfig;
