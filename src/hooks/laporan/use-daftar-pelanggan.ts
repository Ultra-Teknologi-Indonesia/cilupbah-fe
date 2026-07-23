"use client";

import { useMutation } from "@tanstack/react-query";

import { DaftarPelangganService } from "@/services/laporan/daftar-pelanggan.service";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExportCustomerList() {
  return useMutation({
    mutationFn: async (params: { from: string; to: string }) => {
      const blob = await DaftarPelangganService.exportCustomerList(params);
      downloadBlob(blob, `daftar-pelanggan-${params.from}-${params.to}.xlsx`);
    },
  });
}
