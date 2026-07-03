"use client";

import { useEffect } from "react";
import { AlertTriangleIcon, RotateCcwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

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
