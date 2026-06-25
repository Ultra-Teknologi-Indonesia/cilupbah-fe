"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { OutboundTransferService } from "@/services/barang-keluar/outbound-transfer.service"
import type { InventoryTransferListParams } from "@/types/barang-masuk/inventory-transfer"
import type { CreateTransferDraftPayload, AddTransferItemPayload } from "@/services/barang-keluar/outbound-transfer.service"

const STALE = 30 * 1000

export function useOutboundDrafts(params: InventoryTransferListParams = {}) {
  return useQuery({
    queryKey: ["outbound-transfer", "drafts", params],
    queryFn: () => OutboundTransferService.listDrafts(params),
    staleTime: STALE,
  })
}

export function useOutboundApproved(params: InventoryTransferListParams = {}) {
  return useQuery({
    queryKey: ["outbound-transfer", "approved", params],
    queryFn: () => OutboundTransferService.listApproved(params),
    staleTime: STALE,
  })
}

export function useOutboundTransit(params: InventoryTransferListParams = {}) {
  return useQuery({
    queryKey: ["outbound-transfer", "transit", params],
    queryFn: () => OutboundTransferService.listTransit(params),
    staleTime: STALE,
  })
}

export function useOutboundFinished(params: InventoryTransferListParams = {}) {
  return useQuery({
    queryKey: ["outbound-transfer", "finished", params],
    queryFn: () => OutboundTransferService.listFinished(params),
    staleTime: STALE,
  })
}

export function useOutboundTransferDetail(id?: string) {
  return useQuery({
    queryKey: ["outbound-transfer", "detail", id],
    queryFn: () => OutboundTransferService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useCreateTransferDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTransferDraftPayload) => OutboundTransferService.createDraft(data),
    onSuccess: () => {
      toast.success("Draft transfer berhasil dibuat")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal membuat draft"),
  })
}

export function useAddTransferItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AddTransferItemPayload }) =>
      OutboundTransferService.addItem(id, data),
    onSuccess: () => {
      toast.success("Item berhasil ditambahkan")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal menambah item"),
  })
}

export function useRemoveTransferItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, itemId }: { id: string; itemId: string }) =>
      OutboundTransferService.removeItem(id, itemId),
    onSuccess: () => {
      toast.success("Item berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal menghapus item"),
  })
}

export function useApproveTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { approved_by: string; assigned_to?: number } }) =>
      OutboundTransferService.approve(id, data),
    onSuccess: () => {
      toast.success("Transfer berhasil di-approve")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal approve transfer"),
  })
}

export function useShipTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { shipped_by: string } }) =>
      OutboundTransferService.ship(id, data),
    onSuccess: () => {
      toast.success("Transfer berhasil dikirim — stok telah dikurangi")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal mengirim transfer"),
  })
}

export function useCancelTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { cancelled_by: string; cancel_reason?: string } }) =>
      OutboundTransferService.cancel(id, data),
    onSuccess: () => {
      toast.success("Transfer berhasil dibatalkan")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal membatalkan transfer"),
  })
}

export function useDeleteTransfer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => OutboundTransferService.delete(id),
    onSuccess: () => {
      toast.success("Transfer berhasil dihapus")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal menghapus transfer"),
  })
}

export function useMarkTransferPrinted() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { transfer_id: string; printed_by: string }) =>
      OutboundTransferService.markPrinted(data),
    onSuccess: () => {
      toast.success("Transfer ditandai sudah dicetak")
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] })
    },
    onError: (err) => toast.error((err as { message?: string })?.message || "Gagal menandai cetak"),
  })
}
