"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { ReturnSettlementService } from "@/services/barang-masuk/return-settlement.service"
import type { CreateRefundPayload, CreateInvoiceDeductionPayload } from "@/types/barang-masuk/return-settlement"

const KEY = ["return-settlement"]

/** Cari settlement untuk sebuah return (relasi 1:1, tanpa endpoint filter khusus). */
export function useReturnSettlementForReturn(returnId: string, enabled = true) {
  return useQuery({
    queryKey: [...KEY, "for-return", returnId],
    enabled: enabled && !!returnId,
    queryFn: async () => {
      const { items } = await ReturnSettlementService.list(200)
      const found = items.find((s) => s.return_id === returnId)
      return found ? await ReturnSettlementService.getById(found.id) : null
    },
    staleTime: 15 * 1000,
  })
}

function useInvalidate() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: KEY })
    qc.invalidateQueries({ queryKey: ["sales-return"] })
  }
}

export function useCreateReturnSettlement() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (data: { return_id: string; notes?: string }) => ReturnSettlementService.create(data),
    onSuccess: () => { toast.success("Settlement dibuat"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal membuat settlement"),
  })
}

export function useConfirmReturnSettlement() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => ReturnSettlementService.confirm(id),
    onSuccess: () => { toast.success("Settlement dikonfirmasi"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal konfirmasi settlement"),
  })
}

export function useCompleteReturnSettlement() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => ReturnSettlementService.complete(id),
    onSuccess: () => { toast.success("Settlement selesai"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal menyelesaikan settlement"),
  })
}

export function useDeleteReturnSettlement() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => ReturnSettlementService.remove(id),
    onSuccess: () => { toast.success("Settlement dihapus"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal menghapus settlement"),
  })
}

export function useAddRefund() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (data: CreateRefundPayload) => ReturnSettlementService.addRefund(data),
    onSuccess: () => { toast.success("Refund ditambahkan"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal menambah refund"),
  })
}

export function useRemoveRefund() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => ReturnSettlementService.removeRefund(id),
    onSuccess: () => { toast.success("Refund dihapus"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal menghapus refund"),
  })
}

export function useAddInvoiceDeduction() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (data: CreateInvoiceDeductionPayload) => ReturnSettlementService.addInvoiceDeduction(data),
    onSuccess: () => { toast.success("Potong faktur ditambahkan"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal menambah potong faktur"),
  })
}

export function useRemoveInvoiceDeduction() {
  const invalidate = useInvalidate()
  return useMutation({
    mutationFn: (id: string) => ReturnSettlementService.removeInvoiceDeduction(id),
    onSuccess: () => { toast.success("Potong faktur dihapus"); invalidate() },
    onError: (e) => toast.error((e as { message?: string })?.message || "Gagal menghapus potong faktur"),
  })
}
