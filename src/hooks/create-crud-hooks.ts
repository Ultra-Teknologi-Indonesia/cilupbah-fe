"use client"

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query"
import { toast } from "sonner"

// Factory untuk pola CRUD react-query yang sebelumnya di-copy-paste per modul
// (lihat AUDIT-FE.md §4.3). Menstandardisasi: staleTime, keepPreviousData
// untuk list berpaginasi, toast sukses/gagal, dan invalidasi GRANULAR —
// mutasi menyasar key list/detail yang terdampak, bukan root key yang
// me-refetch semua query aktif modul sekaligus (§1.3).
//
// Contoh pemakaian: hooks/pesanan/use-orders.ts (queries) dan
// hooks/pesanan/use-order-actions.ts (mutations).

const DEFAULT_STALE = 30_000

export interface ResourceKeys {
  /** Root modul, mis. ["pesanan"]. Pakai hanya bila SEMUA data modul basi. */
  all: readonly string[]
  /** Prefix semua list — target invalidasi standar setelah mutasi. */
  lists: readonly unknown[]
  list: (params: unknown) => QueryKey
  /** Prefix semua detail. */
  details: readonly unknown[]
  detail: (id: string) => QueryKey
}

export function createResourceKeys(root: string): ResourceKeys {
  const all = [root] as const
  const lists = [...all, "list"] as const
  const details = [...all, "detail"] as const
  return {
    all,
    lists,
    list: (params) => [...lists, params],
    details,
    detail: (id) => [...details, id],
  }
}

export function createListHook<TParams, TData>(
  keys: ResourceKeys,
  fetcher: (params: TParams) => Promise<TData>,
  opts?: { staleTime?: number }
) {
  return function useList(params: TParams, options?: { enabled?: boolean }) {
    return useQuery({
      queryKey: keys.list(params),
      queryFn: () => fetcher(params),
      staleTime: opts?.staleTime ?? DEFAULT_STALE,
      placeholderData: keepPreviousData,
      enabled: options?.enabled ?? true,
    })
  }
}

export function createDetailHook<TData>(
  keys: ResourceKeys,
  fetcher: (id: string) => Promise<TData>,
  opts?: { staleTime?: number }
) {
  return function useDetail(id?: string) {
    return useQuery({
      queryKey: keys.detail(id ?? ""),
      queryFn: () => fetcher(id!),
      enabled: !!id,
      staleTime: opts?.staleTime ?? DEFAULT_STALE,
    })
  }
}

interface MutationConfig<TVars, TData> {
  mutationFn: (vars: TVars) => Promise<TData>
  /** Toast sukses; string atau fungsi dari hasil+vars. Kosongkan = tanpa toast. */
  successMessage?: string | ((data: TData, vars: TVars) => string)
  /** Fallback toast gagal bila error backend tidak membawa message. */
  errorMessage?: string
  /** true = tanpa toast gagal (pemanggil menangani error sendiri, mis. mutateAsync + try/catch). */
  silentError?: boolean
  /**
   * Query key yang terdampak mutasi ini — segranular mungkin, mis.
   * [keys.lists, keys.detail(vars.id)]. Hindari keys.all kecuali memang
   * seluruh modul basi.
   */
  invalidates: (vars: TVars, data: TData) => readonly (QueryKey | readonly unknown[])[]
  onSuccess?: (data: TData, vars: TVars) => void
}

export function createMutationHook<TVars, TData = unknown>(
  config: MutationConfig<TVars, TData>
) {
  return function useResourceMutation() {
    const qc = useQueryClient()
    return useMutation({
      mutationFn: config.mutationFn,
      onSuccess: (data, vars) => {
        if (config.successMessage) {
          toast.success(
            typeof config.successMessage === "function"
              ? config.successMessage(data, vars)
              : config.successMessage
          )
        }
        for (const key of config.invalidates(vars, data)) {
          qc.invalidateQueries({ queryKey: key as QueryKey })
        }
        config.onSuccess?.(data, vars)
      },
      onError: (err: unknown) => {
        if (config.silentError) return
        const message = (err as { message?: string })?.message
        toast.error(message || config.errorMessage || "Terjadi kesalahan")
      },
    })
  }
}
