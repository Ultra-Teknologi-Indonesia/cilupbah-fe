"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { BrandService } from "@/services/kategori-merek/brand.service"

const STALE = 60 * 1000

export function useBrands(params: { search?: string; page?: number; perPage?: number } = {}) {
  return useQuery({
    queryKey: ["brand", "list", params],
    queryFn: () => BrandService.getPaginated(params),
    staleTime: STALE,
  })
}

export function useAllBrands() {
  return useQuery({
    queryKey: ["brand", "all"],
    queryFn: () => BrandService.getAll(),
    staleTime: STALE,
  })
}

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: BrandService.create,
    onSuccess: () => {
      toast.success("Merek berhasil ditambahkan")
      qc.invalidateQueries({ queryKey: ["brand"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "brands"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menambahkan merek"),
  })
}

export function useUpdateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      BrandService.update(id, { name }),
    onSuccess: () => {
      toast.success("Merek berhasil diperbarui")
      qc.invalidateQueries({ queryKey: ["brand"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "brands"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui merek"),
  })
}

export function useDeleteBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: BrandService.delete,
    onSuccess: () => {
      toast.success("Merek berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["brand"] })
      qc.invalidateQueries({ queryKey: ["master-produk", "lookup", "brands"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus merek. Pastikan merek tidak digunakan oleh produk."),
  })
}
