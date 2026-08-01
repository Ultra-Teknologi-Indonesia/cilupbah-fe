"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  ChannelService,
  type StockAllocationListResult,
  type StockAllocationParams,
} from "@/services/channel/channel.service";
import type { StockSourceMode } from "@/types/channel";
import { apiError } from "@/lib/toast";
import { freshOnViewOptions } from "@/lib/query-config";
import { CHANNEL_STORES_KEY } from "./use-connected-stores";

export type { StockAllocationParams };

const all = ["channel", "stock-allocation"] as const;

export const stockAllocationKeys = {
  all,
  list: (params: StockAllocationParams) => [...all, "list", params] as const,
};

export function useStockAllocationStores(params: StockAllocationParams = {}) {
  return useQuery({
    queryKey: stockAllocationKeys.list(params),
    queryFn: () => ChannelService.listStockAllocation(params),
    ...freshOnViewOptions,
  });
}

interface UpdateStockAllocationInput {
  storeId: string;
  stockSourceMode: StockSourceMode;
  locationId?: string | null;
}

export function useUpdateStockAllocation(params: StockAllocationParams) {
  const qc = useQueryClient();
  const key = stockAllocationKeys.list(params);

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
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<StockAllocationListResult>(key);
      qc.setQueryData<StockAllocationListResult>(key, (old) =>
        old
          ? {
              ...old,
              items: old.items.map((s) =>
                s.storeId === storeId
                  ? {
                      ...s,
                      stockSourceMode,
                      locationId:
                        stockSourceMode === "total"
                          ? null
                          : (locationId ?? null),
                    }
                  : s,
              ),
            }
          : old,
      );
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(key, ctx.prev);
      apiError(err, "Gagal memperbarui sumber stok");
    },
    onSuccess: () => toast.success("Berhasil memperbarui sumber stok"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: stockAllocationKeys.all });
      qc.invalidateQueries({ queryKey: CHANNEL_STORES_KEY });
    },
  });
}
