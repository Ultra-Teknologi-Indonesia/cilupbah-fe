"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { SalesmanService } from "@/services/kontak-pemasok/salesman.service"
import type { SalesmanListParams, SalesmanFormData } from "@/types/kontak-pemasok/salesman"

const STALE = 60 * 1000

export function useSalesmen(params: SalesmanListParams = {}) {
  return useQuery({
    queryKey: ["salesman", "list", params],
    queryFn: () => SalesmanService.list(params),
    staleTime: STALE,
  })
}

export function useSalesmanDetail(id?: string) {
  return useQuery({
    queryKey: ["salesman", "detail", id],
    queryFn: () => SalesmanService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useAllSalesmen() {
  return useQuery({
    queryKey: ["salesman", "all"],
    queryFn: () => SalesmanService.getAll(),
    staleTime: STALE,
  })
}

export function useCreateSalesman() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: SalesmanService.create,
    onSuccess: () => {
      toast.success("Salesman berhasil ditambahkan")
      qc.invalidateQueries({ queryKey: ["salesman"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menambahkan salesman"),
  })
}

export function useUpdateSalesman() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SalesmanFormData }) =>
      SalesmanService.update(id, data),
    onSuccess: () => {
      toast.success("Salesman berhasil diperbarui")
      qc.invalidateQueries({ queryKey: ["salesman"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memperbarui salesman"),
  })
}

export function useDeleteSalesman() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: SalesmanService.delete,
    onSuccess: () => {
      toast.success("Salesman berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["salesman"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menghapus salesman"),
  })
}
