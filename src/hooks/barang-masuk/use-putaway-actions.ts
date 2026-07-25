"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PutawayService } from "@/services/barang-masuk/putaway.service";
import type {
  AssignStaffPayload,
  ProcessItemPayload,
  BinListItem,
  PutawayDeleteAction,
} from "@/services/barang-masuk/putaway.service";
import { apiError } from "@/lib/toast";

export type { BinListItem };

const STALE = 30 * 1000;

const DELETE_MESSAGE: Record<PutawayDeleteAction, string> = {
  unassigned: "Penempatan dihapus, penerimaan dikembalikan",
  reset_not_started: "Penempatan direset ke Belum Mulai",
  reset_in_progress: "Penempatan dikembalikan ke Sedang Diproses",
};

export function usePutawayBins(locationId?: string) {
  return useQuery({
    queryKey: ["putaway", "bins", locationId],
    queryFn: () => PutawayService.listBins(locationId!),
    enabled: !!locationId,
    staleTime: 60 * 1000,
  });
}

export function usePutawayDetail(id?: string) {
  return useQuery({
    queryKey: ["putaway", "detail", id],
    queryFn: () => PutawayService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function usePutawayItems(id?: string) {
  return useQuery({
    queryKey: ["putaway", "items", id],
    queryFn: () => PutawayService.getItems(id!),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useAssignPutawayStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignStaffPayload) =>
      PutawayService.assignStaff(payload),
    onSuccess: () => {
      toast.success("Petugas berhasil di-assign");
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) =>
      apiError(err, "Gagal assign petugas"),
  });
}

export function useStartPutaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PutawayService.start(id),
    onSuccess: () => {
      toast.success("Putaway berhasil dimulai");
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) =>
      apiError(err, "Gagal memulai putaway"),
  });
}

export function useCompletePutaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PutawayService.complete(id),
    onSuccess: () => {
      toast.success("Penempatan berhasil diselesaikan");
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menyelesaikan penempatan"),
  });
}

export function useProcessPutawayItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      putawayId,
      itemId,
      payload,
    }: {
      putawayId: string;
      itemId: string;
      payload: ProcessItemPayload;
    }) => PutawayService.processItem(putawayId, itemId, payload),
    onSuccess: () => {
      toast.success("Item berhasil ditempatkan");
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menempatkan item"),
  });
}

export function useDeletePutaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => PutawayService.remove(id),
    onSuccess: (res) => {
      toast.success(
        (res && DELETE_MESSAGE[res.action]) || "Penempatan berhasil dihapus",
      );
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menghapus penempatan"),
  });
}

export function useBulkDeletePutaway() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => PutawayService.bulkRemove(ids),
    onSuccess: (res) => {
      const n = res?.length ?? 0;
      toast.success(`${n} penempatan berhasil diproses`);
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menghapus penempatan terpilih"),
  });
}

export function useDeletePutawayPlacement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      putawayId,
      itemId,
      placementId,
      qty,
    }: {
      putawayId: string;
      itemId: string;
      placementId: string;
      qty?: number;
    }) => PutawayService.deletePlacement(putawayId, itemId, placementId, qty),
    onSuccess: () => {
      toast.success("Penempatan berhasil dikoreksi, stok dikembalikan ke rak asal");
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) =>
      apiError(err, "Gagal mengoreksi penempatan"),
  });
}

export function useUnassignPutaway(putawayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      reason_code: string;
      reason_note?: string;
      new_assignee_id?: string;
    }) => PutawayService.unassign(putawayId, payload),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.new_assignee_id
          ? "Tugas putaway berhasil dialihkan"
          : "Assignment putaway dibatalkan",
      );
      qc.invalidateQueries({ queryKey: ["putaway"] });
    },
    onError: (err) => apiError(err, "Gagal mengalihkan tugas putaway"),
  });
}

export function useResetPutawayAssignment(putawayId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reason_note: string; new_assignee_id?: string }) =>
      PutawayService.resetAssignment(putawayId, payload),
    onSuccess: () => {
      toast.success("Putaway berhasil di-reset, semua penempatan dibalik");
      qc.invalidateQueries({ queryKey: ["putaway"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err) => apiError(err, "Gagal reset putaway"),
  });
}
