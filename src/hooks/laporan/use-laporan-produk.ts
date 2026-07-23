"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";

import { LaporanProdukService } from "@/services/laporan/laporan-produk.service";
import type { SalesProductParams } from "@/types/laporan/laporan-produk";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function useExportSalesProduct() {
  return useMutation({
    mutationFn: async (params: SalesProductParams) => {
      const blob = await LaporanProdukService.exportSalesProduct(params);
      downloadBlob(
        blob,
        `daftar-penjualan-produk-${params.from}-${params.to}.xlsx`,
      );
    },
  });
}

export function useSkuOptionsInfinite(search: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ["laporan", "produk", "sku-options", search],
    queryFn: ({ pageParam }) =>
      LaporanProdukService.searchSkuOptions(search, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    enabled,
  });
}
