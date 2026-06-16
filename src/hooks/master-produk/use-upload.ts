"use client"

import * as React from "react"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import type { PaginationState } from "@tanstack/react-table"
import { toast } from "sonner"

import {
  UploadService,
  type UploadableParams,
} from "@/services/master-produk/upload.service"

export const uploadableKey = (params: UploadableParams) =>
  ["master-produk", "uploadable", params] as const


export function useUploadableProducts(params: UploadableParams) {
  return useQuery({
    queryKey: uploadableKey(params),
    queryFn: () => UploadService.uploadable(params),
    enabled: !!params.shopId,
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })
}


export function useUploadableQuery() {
  const [shopId, setShopIdRaw] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  })

  const resetPage = React.useCallback(
    () => setPagination((p) => ({ ...p, pageIndex: 0 })),
    []
  )

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      resetPage()
    }, 350)
    return () => clearTimeout(t)
  }, [search, resetPage])

  const setShopId = React.useCallback(
    (v: string | null) => {
      setShopIdRaw(v)
      resetPage()
    },
    [resetPage]
  )

  const result = useUploadableProducts({
    shopId: shopId ?? "",
    search: debouncedSearch || undefined,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  })

  return {
    shopId,
    setShopId,
    search,
    setSearch,
    pagination,
    setPagination,
    result,
  }
}


function useInvalidateUpload() {
  const qc = useQueryClient()
  return React.useCallback(() => {
    qc.invalidateQueries({ queryKey: ["master-produk", "uploadable"] })
    qc.invalidateQueries({ queryKey: ["master-produk", "channel-drafts"] })
    qc.invalidateQueries({ queryKey: ["master-produk", "list"] })
    qc.invalidateQueries({ queryKey: ["channel-monitor"] })
  }, [qc])
}


export function useUploadToShop() {
  const invalidate = useInvalidateUpload()

  return useMutation({
    mutationFn: ({
      productIds,
      shopId,
    }: {
      productIds: string[]
      shopId: string
    }) => UploadService.uploadProductsToShop(productIds, shopId),
    onSuccess: (res) => {
      if (res.uploaded > 0) {
        toast.success(`${res.uploaded} produk diantrekan untuk upload`)
      }
      if (res.skipped.length > 0) {
        toast.warning(`${res.skipped.length} produk dilewati`, {
          description: res.skipped
            .map((s) => s.reason)
            .slice(0, 3)
            .join("; "),
        })
      }
      if (res.uploaded === 0 && res.skipped.length === 0) {
        toast("Tidak ada produk yang diantrekan")
      }
      invalidate()
    },
    onError: (err) => {
      const message = (err as { message?: string })?.message
      toast.error(message || "Upload gagal diproses")
    },
  })
}
