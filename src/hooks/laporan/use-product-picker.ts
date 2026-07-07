"use client";

import { useQuery } from "@tanstack/react-query";

import { ProductPickerService } from "@/services/laporan/product-picker.service";

export function useProductPickerSearch(
  mode: "sku" | "sku_induk",
  query: string,
) {
  return useQuery({
    queryKey: ["laporan", "product-picker", mode, query],
    queryFn: () =>
      mode === "sku"
        ? ProductPickerService.searchVariants(query)
        : ProductPickerService.searchProducts(query),
    staleTime: 30_000,
  });
}
