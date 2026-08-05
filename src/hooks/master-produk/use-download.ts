"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  DownloadService,
  type DownloadTransactionParams,
  type DownloadTransactionDetailParams,
} from "@/services/master-produk/download.service";
import { apiError } from "@/lib/toast";

export { channelSearchRowId } from "@/services/master-produk/download.service";
export type {
  ChannelSearchItem,
  ChannelSearchPage,
  DownloadState,
  DownloadTransaction,
} from "@/services/master-produk/download.service";

export const downloadTrxKey = (params: DownloadTransactionParams) =>
  ["master-produk", "download-transactions", params] as const;

export const downloadTrxDetailKey = (
  id: string,
  params: DownloadTransactionDetailParams,
) => ["master-produk", "download-transaction", id, params] as const;

export function useDownloadTransactions(params: DownloadTransactionParams) {
  return useQuery({
    queryKey: downloadTrxKey(params),
    queryFn: () => DownloadService.listTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,

    refetchInterval: (query) => {
      const items = query.state.data?.items ?? [];
      return items.some(
        (t) => t.state === "downloading" || t.state === "queued",
      )
        ? 5000
        : false;
    },
  });
}

export function useDownloadTransactionDetail(
  id: string | null,
  params: DownloadTransactionDetailParams,
) {
  return useQuery({
    queryKey: downloadTrxDetailKey(id ?? "", params),
    queryFn: () => DownloadService.getTransaction(id as string, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,

    refetchInterval: (query) => {
      const state = query.state.data?.state;
      return state === "downloading" || state === "queued" ? 5000 : false;
    },
  });
}

export function useInvalidateDownloads() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({
      queryKey: ["master-produk", "download-transactions"],
    });
    qc.invalidateQueries({
      queryKey: ["master-produk", "download-transaction"],
    });
  };
}

export function useApproveProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) =>
      DownloadService.approveProduct(productId),
    onSuccess: () => {
      toast.success("Produk dijadikan master");
      qc.invalidateQueries({
        queryKey: ["master-produk", "download-transaction"],
      });
      qc.invalidateQueries({ queryKey: ["master-produk"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menjadikan master"),
  });
}

export function useStartDownload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (stores: { channel: string; shopId: string }[]) => {
      const byChannel = new Map<string, string[]>();
      for (const s of stores) {
        if (!s.channel || !s.shopId) continue;
        byChannel.set(s.channel, [
          ...(byChannel.get(s.channel) ?? []),
          s.shopId,
        ]);
      }
      const entries = Array.from(byChannel);
      const results = await Promise.allSettled(
        entries.map(([channel, shopIds]) =>
          shopIds.length === 1
            ? DownloadService.downloadShop(channel, shopIds[0])
            : DownloadService.downloadShopBulk(channel, shopIds),
        ),
      );

      const succeeded: { channel: string; count: number }[] = [];
      const failed: { channel: string; count: number }[] = [];
      results.forEach((r, i) => {
        const [channel, shopIds] = entries[i];
        (r.status === "fulfilled" ? succeeded : failed).push({
          channel,
          count: shopIds.length,
        });
      });

      if (succeeded.length === 0) {
        const rejected = results.find(
          (r): r is PromiseRejectedResult => r.status === "rejected",
        );
        throw rejected?.reason ?? new Error("Semua download gagal diantrekan");
      }

      return { succeeded, failed };
    },
    onSuccess: ({ succeeded, failed }) => {
      const okCount = succeeded.reduce((sum, s) => sum + s.count, 0);
      toast.success(`Download ${okCount} toko diantrekan`, {
        description: "Pantau progresnya di tab Progress.",
      });
      if (failed.length > 0) {
        const failCount = failed.reduce((sum, f) => sum + f.count, 0);
        toast.warning(`${failCount} toko gagal diantrekan`, {
          description: `Channel gagal: ${failed.map((f) => f.channel).join(", ")}`,
        });
      }
      qc.invalidateQueries({
        queryKey: ["master-produk", "download-transactions"],
      });
    },
    onError: (err) =>
      apiError(err, "Gagal memulai download"),
  });
}

export function useChannelSearchPage() {
  return useMutation({
    mutationFn: (params: {
      channel: string;
      shopId: string;
      q: string;
      offset: number;
      limit: number;
    }) => DownloadService.searchChannel(params),
    onError: (err) => apiError(err, "Gagal mencari produk"),
  });
}

export function useDownloadProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      channel: string;
      shopId: string;
      externalProductId: string;
    }) => DownloadService.downloadProduct(params),
    onSuccess: () => {
      toast.success("Produk diunduh dari channel");
      qc.invalidateQueries({
        queryKey: ["master-produk", "download-transactions"],
      });
      qc.invalidateQueries({ queryKey: ["master-produk"] });
    },
    onError: (err) =>
      apiError(err, "Gagal mengunduh produk"),
  });
}
