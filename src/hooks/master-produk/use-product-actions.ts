"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { ProductDetailService } from "@/services/master-produk/product-detail.service"

const LIST_KEY = ["master-produk", "list"] as const
const ARCHIVE_KEY = ["master-produk", "archive"] as const

export function useDeleteProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ProductDetailService.delete(id),
    onSuccess: () => {
      toast.success("Produk berhasil dihapus")
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus produk"),
  })
}

export function useArchiveProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      ProductDetailService.lifecycle(id, "archive", reason ? { reason } : undefined),
    onSuccess: () => {
      toast.success("Produk berhasil diarsipkan")
      qc.invalidateQueries({ queryKey: LIST_KEY })
      qc.invalidateQueries({ queryKey: ARCHIVE_KEY })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal mengarsipkan produk"),
  })
}

export function useBulkArchive() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason?: string }) =>
      ProductDetailService.bulkArchive(ids, reason),
    onSuccess: (data) => {
      if (data.success > 0) toast.success(`${data.success} produk diarsipkan`)
      if (data.failed > 0) toast.error(`${data.failed} produk gagal diarsipkan`, {
        description: data.errors[0],
      })
      qc.invalidateQueries({ queryKey: LIST_KEY })
      qc.invalidateQueries({ queryKey: ARCHIVE_KEY })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal mengarsipkan produk"),
  })
}

export function useBulkRestore() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => ProductDetailService.bulkRestore(ids),
    onSuccess: (data) => {
      if (data.success > 0) toast.success(`${data.success} produk dipulihkan`)
      if (data.failed > 0) toast.error(`${data.failed} produk gagal dipulihkan`, {
        description: data.errors[0],
      })
      qc.invalidateQueries({ queryKey: LIST_KEY })
      qc.invalidateQueries({ queryKey: ARCHIVE_KEY })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memulihkan produk"),
  })
}

export function useBulkDelete() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => ProductDetailService.bulkDelete(ids),
    onSuccess: (data) => {
      if (data.success > 0) toast.success(`${data.success} produk dihapus`)
      if (data.failed > 0) toast.error(`${data.failed} produk gagal dihapus`, {
        description: data.errors[0],
      })
      qc.invalidateQueries({ queryKey: LIST_KEY })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus produk"),
  })
}
