"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  DownloadService,
  type DownloadTransactionParams,
  type DownloadTransactionDetailParams,
} from "@/services/master-produk/download.service"

export const downloadTrxKey = (params: DownloadTransactionParams) =>
  ["master-produk", "download-transactions", params] as const

export const downloadTrxDetailKey = (id: string, params: DownloadTransactionDetailParams) =>
  ["master-produk", "download-transaction", id, params] as const

export function useDownloadTransactions(params: DownloadTransactionParams) {
  return useQuery({
    queryKey: downloadTrxKey(params),
    queryFn: () => DownloadService.listTransactions(params),
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
    // Polling ringan saat ada transaksi berjalan.
    refetchInterval: (query) => {
      const items = query.state.data?.items ?? []
      return items.some((t) => t.state === "downloading" || t.state === "queued") ? 5000 : false
    },
  })
}

export function useDownloadTransactionDetail(
  id: string | null,
  params: DownloadTransactionDetailParams
) {
  return useQuery({
    queryKey: downloadTrxDetailKey(id ?? "", params),
    queryFn: () => DownloadService.getTransaction(id as string, params),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 15 * 1000,
  })
}

export function useInvalidateDownloads() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: ["master-produk", "download-transactions"] })
    qc.invalidateQueries({ queryKey: ["master-produk", "download-transaction"] })
  }
}

/** Jadikan Master — promosikan produk hasil download. */
export function useApproveProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => DownloadService.approveProduct(productId),
    onSuccess: () => {
      toast.success("Produk dijadikan master")
      qc.invalidateQueries({ queryKey: ["master-produk", "download-transaction"] })
      qc.invalidateQueries({ queryKey: ["master-produk"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menjadikan master"),
  })
}

/**
 * Download Massal — terima daftar toko terpilih (channel + shopId), kelompokkan
 * per channel, lalu dispatch single/bulk per channel.
 */
export function useStartDownload() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (stores: { channel: string; shopId: string }[]) => {
      const byChannel = new Map<string, string[]>()
      for (const s of stores) {
        if (!s.channel || !s.shopId) continue
        byChannel.set(s.channel, [...(byChannel.get(s.channel) ?? []), s.shopId])
      }
      await Promise.all(
        Array.from(byChannel, ([channel, shopIds]) =>
          shopIds.length === 1
            ? DownloadService.downloadShop(channel, shopIds[0])
            : DownloadService.downloadShopBulk(channel, shopIds)
        )
      )
      return stores.length
    },
    onSuccess: (count) => {
      toast.success(`Download ${count} toko diantrekan`, {
        description: "Pantau progresnya di tab Progress.",
      })
      qc.invalidateQueries({ queryKey: ["master-produk", "download-transactions"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memulai download"),
  })
}

/** Download Satuan — cari produk di channel. */
export function useChannelSearch() {
  return useMutation({
    mutationFn: (params: { channel: string; shopId: string; q: string }) =>
      DownloadService.searchChannel(params),
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal mencari produk"),
  })
}

/** Download Satuan — download satu produk by external id. */
export function useDownloadProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (params: { channel: string; shopId: string; externalProductId: string }) =>
      DownloadService.downloadProduct(params),
    onSuccess: () => {
      toast.success("Produk diunduh dari channel")
      qc.invalidateQueries({ queryKey: ["master-produk", "download-transactions"] })
      qc.invalidateQueries({ queryKey: ["master-produk"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal mengunduh produk"),
  })
}
