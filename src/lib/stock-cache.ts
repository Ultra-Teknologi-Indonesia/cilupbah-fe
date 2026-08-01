import type { QueryClient } from "@tanstack/react-query";

export const STOCK_VIEW_KEYS = [
  ["inventory"],
  ["monitor-stok"],
  ["laporan", "stok-minus"],
] as const;

export function invalidateStockViews(qc: QueryClient): void {
  for (const queryKey of STOCK_VIEW_KEYS) {
    qc.invalidateQueries({ queryKey });
  }
}
