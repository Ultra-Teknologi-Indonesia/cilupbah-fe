"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { PutawayService } from "@/services/barang-masuk/putaway.service"
import type { AssignStaffPayload, ProcessItemPayload } from "@/services/barang-masuk/putaway.service"

const STALE = 30 * 1000

export function usePutawayDetail(id?: string) {
  return useQuery({
    queryKey: ["putaway", "detail", id],
    queryFn: () => PutawayService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function usePutawayItems(id?: string) {
  return useQuery({
    queryKey: ["putaway", "items", id],
    queryFn: () => PutawayService.getItems(id!),
    enabled: !!id,
    staleTime: STALE,
  })
}

export function useAssignPutawayStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: AssignStaffPayload) => PutawayService.assignStaff(payload),
    onSuccess: () => {
      toast.success("Petugas berhasil di-assign")
      qc.invalidateQueries({ queryKey: ["putaway"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal assign petugas"),
  })
}

export function useStartPutaway() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => PutawayService.start(id),
    onSuccess: () => {
      toast.success("Putaway berhasil dimulai")
      qc.invalidateQueries({ queryKey: ["putaway"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal memulai putaway"),
  })
}

export function useProcessPutawayItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ putawayId, itemId, payload }: { putawayId: string; itemId: string; payload: ProcessItemPayload }) =>
      PutawayService.processItem(putawayId, itemId, payload),
    onSuccess: () => {
      toast.success("Item berhasil ditempatkan")
      qc.invalidateQueries({ queryKey: ["putaway"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menempatkan item"),
  })
}

export function useCompletePutaway() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => PutawayService.complete(id),
    onSuccess: () => {
      toast.success("Putaway berhasil diselesaikan")
      qc.invalidateQueries({ queryKey: ["putaway"] })
      qc.invalidateQueries({ queryKey: ["inbound"] })
    },
    onError: (err) =>
      toast.error((err as { message?: string })?.message || "Gagal menyelesaikan putaway"),
  })
}
