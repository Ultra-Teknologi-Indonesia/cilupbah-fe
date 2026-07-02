"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { toast } from "sonner"

import {
  NaikkanService,
  type NaikkanListParams,
  type NaikkanDetailParams,
  type NaikkanHistoryParams,
} from "@/services/master-produk/naikkan.service"
import { ChannelProductService } from "@/services/master-produk/channel-product.service"

export type {
  RaiseProductDetail,
  RaiseProductStore,
} from "@/services/master-produk/naikkan.service"

const KEY = "naikkan"

export const naikkanListKey = (params: NaikkanListParams) =>
  [KEY, "list", params] as const

export const naikkanDetailKey = (id: string, params: NaikkanDetailParams) =>
  [KEY, "detail", id, params] as const

export const naikkanHistoryKey = (id: string, params: NaikkanHistoryParams) =>
  [KEY, "history", id, params] as const

export function useNaikkanList(params: NaikkanListParams) {
  return useQuery({
    queryKey: naikkanListKey(params),
    queryFn: () => NaikkanService.list(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useNaikkanDetail(id: string, params: NaikkanDetailParams) {
  return useQuery({
    queryKey: naikkanDetailKey(id, params),
    queryFn: () => NaikkanService.detail(id, params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: !!id,
  })
}

export function useNaikkanHistory(id: string, params: NaikkanHistoryParams) {
  return useQuery({
    queryKey: naikkanHistoryKey(id, params),
    queryFn: () => NaikkanService.history(id, params),
    placeholderData: keepPreviousData,
    staleTime: 15_000,
    enabled: !!id,
  })
}

/**
 * Picker produk channel untuk dialog Tambah Produk pada detail naikkan.
 * Query key sengaja dipisah (`picker`) dari daftar listing utama.
 */
export function useNaikkanProductPicker(
  shopId: string | null,
  search: string,
  page: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: [KEY, "picker", shopId, search, page],
    queryFn: () =>
      ChannelProductService.list({
        shopId: shopId!,
        search: search || undefined,
        page,
        perPage: 20,
      }),
    enabled: enabled && !!shopId,
  })
}

export function useCreateNaikkan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (shopId: string) => NaikkanService.create(shopId),
    onSuccess: () => {
      toast.success("Data naikkan produk berhasil dibuat")
      qc.invalidateQueries({ queryKey: [KEY, "list"] })
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal membuat data naikkan"
      ),
  })
}

export function useAddNaikkanProduct(raiseProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (mappingId: string) =>
      NaikkanService.addProduct(raiseProductId, mappingId),
    onSuccess: () => {
      toast.success("Produk ditambahkan")
      qc.invalidateQueries({ queryKey: [KEY, "detail", raiseProductId] })
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal menambahkan produk"
      ),
  })
}

export function useUpdateNaikkanProduct(raiseProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      detailId,
      data,
    }: {
      detailId: string
      data: { is_active?: boolean; is_repeatable?: boolean }
    }) => NaikkanService.updateProduct(raiseProductId, detailId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, "detail", raiseProductId] })
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal memperbarui produk"
      ),
  })
}

export function useRemoveNaikkanProduct(raiseProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (detailId: string) =>
      NaikkanService.removeProduct(raiseProductId, detailId),
    onSuccess: () => {
      toast.success("Produk dilepas dari naikkan")
      qc.invalidateQueries({ queryKey: [KEY, "detail", raiseProductId] })
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal melepas produk"
      ),
  })
}

export function useExecuteRaise(raiseProductId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (detailIds?: string[]) =>
      NaikkanService.raise(raiseProductId, detailIds),
    onSuccess: () => {
      toast.success("Produk diantrekan untuk dinaikkan")
      qc.invalidateQueries({ queryKey: [KEY] })
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal menaikkan produk"
      ),
  })
}

export function useDeleteNaikkan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => NaikkanService.destroy(id),
    onSuccess: () => {
      toast.success("Data naikkan produk dihapus")
      qc.invalidateQueries({ queryKey: [KEY, "list"] })
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message ||
          "Gagal menghapus data naikkan"
      ),
  })
}
