import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  experimental: {
    inlineCss: true,
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
