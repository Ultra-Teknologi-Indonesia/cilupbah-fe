import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { LiquidGlassFilter } from "@/components/ui/liquid-glass-filter";
import { PhantomProvider } from "@/components/providers/phantom-provider";

const sfPro = localFont({
  src: [
    { path: "./fonts/SFProDisplay-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/SFProDisplay-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/SFProDisplay-Semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/SFProDisplay-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Cilupbah Superapps - Warehouse Management System Omnichannel",
  description:
    "Cilupbah Superapps - Warehouse Management System Omnichannel untuk sinkronisasi produk, stok, dan pesanan lintas marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={cn("h-full", "antialiased", sfPro.variable, "font-sans")}
      >
      <body className="min-h-full flex flex-col">
        <LiquidGlassFilter />
        <QueryProvider>
          {children}
        </QueryProvider>
        <PhantomProvider />
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
