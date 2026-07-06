"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { ChannelService } from "@/services/channel/channel.service";
import type { StockAllocationStore, StockSourceMode } from "@/types/channel";
import { CHANNEL_STORES_KEY } from "./use-connected-stores";

export const STOCK_ALLOCATION_KEY = ["channel", "stock-allocation"] as const;

export function useStockAllocationStores() {
  return useQuery({
    queryKey: STOCK_ALLOCATION_KEY,
    queryFn: ChannelService.listStockAllocation,
    staleTime: 30 * 1000,
  });
}

interface UpdateStockAllocationInput {
  storeId: string;
  stockSourceMode: StockSourceMode;
  locationId?: string | null;
}

function errMessage(err: unknown, fallback: string): string {
  const m = (err as { message?: string })?.message;
  return typeof m === "string" && m ? m : fallback;
}

export function useUpdateStockAllocation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      stockSourceMode,
      locationId,
    }: UpdateStockAllocationInput) =>
      ChannelService.setStoreFlags(storeId, {
        stock_source_mode: stockSourceMode,
        location_id: stockSourceMode === "total" ? null : locationId,
      }),
    onMutate: async ({ storeId, stockSourceMode, locationId }) => {
      await qc.cancelQueries({ queryKey: STOCK_ALLOCATION_KEY });
      const prev = qc.getQueryData<StockAllocationStore[]>(
        STOCK_ALLOCATION_KEY,
      );
      qc.setQueryData<StockAllocationStore[]>(STOCK_ALLOCATION_KEY, (old) =>
        old?.map((s) =>
          s.storeId === storeId
            ? {
                ...s,
                stockSourceMode,
                locationId: stockSourceMode === "total" ? null : (locationId ?? null),
              }
            : s,
        ),
      );
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(STOCK_ALLOCATION_KEY, ctx.prev);
      toast.error(errMessage(err, "Gagal memperbarui sumber stok"));
    },
    onSuccess: () => toast.success("Berhasil memperbarui sumber stok"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: STOCK_ALLOCATION_KEY });
      qc.invalidateQueries({ queryKey: CHANNEL_STORES_KEY });
    },
  });
}
