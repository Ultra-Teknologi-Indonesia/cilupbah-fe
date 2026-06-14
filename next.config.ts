import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Inline the (atomic Tailwind) CSS into <head> as <style> instead of a
    // render-blocking <link>. Kills the CSS request waterfall → faster FCP/LCP
    // for first-time visitors. Production-only; no effect in dev.
    inlineCss: true,
  },
};

export default nextConfig;
