"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import {
  ProductArchiveService,
  type ArchiveParams,
} from "@/services/master-produk/product-archive.service"
import { ProductDetailService } from "@/services/master-produk/product-detail.service"

const ARCHIVE_KEY = ["master-produk", "archive"] as const

export function useArchivedProducts(params: ArchiveParams) {
  return useQuery({
    queryKey: [...ARCHIVE_KEY, params],
    queryFn: () => ProductArchiveService.list(params),
    staleTime: 30 * 1000,
  })
}

export function useRestoreProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ProductDetailService.lifecycle(id, "restore"),
    onSuccess: () => {
      toast.success("Produk dipulihkan ke Master")
      qc.invalidateQueries({ queryKey: ARCHIVE_KEY })
      qc.invalidateQueries({ queryKey: ["master-produk", "list"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memulihkan produk"),
  })
}
