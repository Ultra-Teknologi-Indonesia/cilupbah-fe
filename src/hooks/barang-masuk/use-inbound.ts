"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  InboundService,
  type InboundReceiptsParams,
} from "@/services/barang-masuk/inbound.service";
import type { InboundListParams } from "@/types/barang-masuk/inbound";
import { apiError } from "@/lib/toast";

const STALE = 30 * 1000;

export function useInbounds(
  params: InboundListParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["inbound", "list", params],
    placeholderData: keepPreviousData,
    queryFn: () => InboundService.list(params),
    staleTime: STALE,
    enabled: options.enabled ?? true,
  });
}

export function useInboundDetail(id?: string, opts: { pollMs?: number } = {}) {
  return useQuery({
    queryKey: ["inbound", "detail", id],
    queryFn: () => InboundService.getById(id!),
    enabled: !!id,
    staleTime: STALE,
    refetchInterval: opts.pollMs ?? false,
  });
}

export function useInboundItems(
  id?: string,
  params: {
    page: number;
    perPage: number;
    search?: string;
    sort?: string;
  } = { page: 1, perPage: 20 },
) {
  return useQuery({
    queryKey: ["inbound", "items", id, params],
    placeholderData: keepPreviousData,
    queryFn: () => InboundService.getItems(id!, params),
    enabled: !!id,
    staleTime: STALE,
  });
}

export function useInboundReceipts(
  id?: string,
  params: InboundReceiptsParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["inbound", "receipts", id, params],
    placeholderData: keepPreviousData,
    queryFn: () => InboundService.getReceipts(id!, params),
    enabled: !!id && (options.enabled ?? true),
    staleTime: STALE,
  });
}

export function useCorrectReceivedLines(inboundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { item_id: string; qty?: number }[]) =>
      InboundService.correctReceivedLines(inboundId, items),
    onSuccess: () => {
      toast.success("Penerimaan dikoreksi, stok dikembalikan dari bin inbound");
      qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err) =>
      apiError(err, "Gagal mengoreksi penerimaan"),
  });
}

/** Batalkan (hapus) beberapa penerimaan sekaligus. */
export function useBulkCancelInbounds() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => InboundService.bulkCancel(ids),
    onSuccess: (res) => {
      const failed = res?.failed?.length ?? 0;
      const ok = res?.cancelled?.length ?? 0;
      if (failed > 0) {
        toast.warning(`${ok} penerimaan dihapus, ${failed} gagal`);
      } else {
        toast.success(`${ok} penerimaan dihapus`);
      }
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["outbound-transfer"] });
      qc.invalidateQueries({ queryKey: ["purchase-order"] });
    },
    onError: (err) =>
      apiError(err, "Gagal menghapus penerimaan"),
  });
}

/** Set jumlah diterima aktual (naik/turun) pada satu baris penerimaan.
 *  Optional expectedUpdatedAt → optimistic lock (fix H4). */
export function useSetReceivedQty(inboundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      itemId,
      qty,
      expectedUpdatedAt,
    }: {
      itemId: string;
      qty: number;
      expectedUpdatedAt?: string | null;
    }) => InboundService.setReceivedQty(inboundId, itemId, qty, expectedUpdatedAt),
    onSuccess: () => {
      toast.success("Jumlah diterima diperbarui");
      qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "items", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err: unknown) => {
      const code = (err as { errors?: { code?: string } })?.errors?.code;
      if (code === "STALE_WRITE") {
        qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
        qc.invalidateQueries({ queryKey: ["inbound", "items", inboundId] });
      }
      apiError(err, "Gagal memperbarui jumlah diterima");
    },
  });
}

/** Tombol A "Alihkan Tugas" — TAHAN progress. */
export function useUnassignInbound(inboundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      reason_code: string;
      reason_note?: string;
      new_assignee_id?: string;
    }) => InboundService.unassign(inboundId, payload),
    onSuccess: (_data, vars) => {
      toast.success(
        vars.new_assignee_id
          ? "Tugas berhasil dialihkan"
          : "Assignment berhasil dibatalkan",
      );
      qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
    },
    onError: (err) => apiError(err, "Gagal mengalihkan tugas"),
  });
}

/** Tombol B "Reset & Alihkan" — reverse stok Bin Inbound + audit. */
export function useResetInboundAssignment(inboundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reason_note: string; new_assignee_id?: string }) =>
      InboundService.resetAssignment(inboundId, payload),
    onSuccess: () => {
      toast.success("Penerimaan berhasil di-reset");
      qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "items", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: (err) => apiError(err, "Gagal reset penerimaan"),
  });
}

/** Fase 2: admin tarik participant sesi mobile. */
export function useWithdrawParticipant(inboundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { userId: string; reasonNote?: string }) =>
      InboundService.withdrawParticipant(
        inboundId,
        payload.userId,
        payload.reasonNote,
      ),
    onSuccess: () => {
      toast.success("Peserta ditarik dari sesi");
      qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
    },
    onError: (err) => apiError(err, "Gagal menarik peserta"),
  });
}

/** F5: buat Inbound susulan dari PO. */
export function useReceiveAdditional() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (poId: string) => InboundService.receiveAdditional(poId),
    onSuccess: () => {
      toast.success("Penerimaan susulan dibuat");
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
      qc.invalidateQueries({ queryKey: ["purchase-order"] });
    },
    onError: (err) => apiError(err, "Gagal membuat penerimaan susulan"),
  });
}

/**
 * Batch-simpan koreksi qty diterima. Hasilnya per-item (fulfilled/rejected)
 * supaya caller bisa menandai baris yang gagal tetap sebagai dirty.
 */
export function useSetReceivedQtyBatch(inboundId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      items,
      expectedUpdatedAt,
    }: {
      items: Array<{ itemId: string; qty: number }>;
      expectedUpdatedAt?: string | null;
    }): Promise<Array<{ itemId: string; ok: boolean; error?: string }>> => {
      const results = await Promise.allSettled(
        items.map((it) =>
          InboundService.setReceivedQty(
            inboundId,
            it.itemId,
            it.qty,
            expectedUpdatedAt,
          ),
        ),
      );
      return items.map((it, idx) => {
        const r = results[idx];
        if (r.status === "fulfilled") return { itemId: it.itemId, ok: true };
        return {
          itemId: it.itemId,
          ok: false,
          error: (r.reason as { message?: string })?.message,
        };
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["inbound", "detail", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "items", inboundId] });
      qc.invalidateQueries({ queryKey: ["inbound", "list"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
    },
  });
}
