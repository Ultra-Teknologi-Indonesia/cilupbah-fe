"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

// Error boundary segmen dashboard: menangkap kegagalan render/fetch di subtree
// dashboard agar tidak menjatuhkan seluruh halaman ke layar putih.
// Next 16.2+: `unstable_retry()` me-fetch ulang lalu render ulang segmen — itu
// yang kita mau karena mayoritas error di sini adalah kegagalan fetch.
// (`reset()` hanya render ulang tanpa fetch ulang, jadi kemungkinan error lagi.)
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard segment error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-7" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Terjadi kesalahan</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Gagal memuat halaman ini. Coba muat ulang; jika masih gagal, periksa
          koneksi atau hubungi tim teknis.
        </p>
      </div>
      <Button onClick={() => unstable_retry()} variant="outline">
        <RotateCcwIcon />
        Coba lagi
      </Button>
    </div>
  );
}
