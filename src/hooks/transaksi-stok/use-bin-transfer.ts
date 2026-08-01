"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/toast";
import { fetchClient } from "@/lib/api-client";
import { LocationBinService } from "@/services/manajemen-rak/location-bin.service";
import { invalidateStockViews } from "@/lib/stock-cache";

export function useLocationBins(locationId: string) {
  return useQuery({
    queryKey: ["location-bins", locationId],
    enabled: !!locationId,
    queryFn: () =>
      LocationBinService.list(locationId, {
        perPage: 200,
        sort: "bin_final_code",
      }),
    staleTime: 60 * 1000,
  });
}

export type BinTransferStatus =
  | "BARU_DIBUAT"
  | "SEDANG_DIJALAN"
  | "SELESAI";

export interface BinTransferItemPayload {
  item_id: string;
  source_bin_id: string;
  qty: number;
  batch_no?: string;
  serial_no?: string;
  expired_date?: string;
  notes?: string;
}

export interface BinTransferPayload {
  location_id: string;
  transfer_number?: string;
  transfer_date?: string;
  created_by: string;
  notes?: string;
  items: BinTransferItemPayload[];
}

export interface BinTransferListItem {
  id: string;
  transfer_number: string;
  transfer_date: string;
  location_id: string;
  status: BinTransferStatus;
  created_by: string;
  printed_at: string | null;
  printed_by: string | null;
  notes: string | null;
  created_at: string;
  items_count: number;
  location?: { id: string; location_name: string } | null;
}

export interface BinTransferReceiptItem {
  id: string;
  bin_transfer_item_id?: string;
  destination_bin?: { id: string; bin_final_code: string } | null;
  qty: number;
}

export interface BinTransferReceiptRef {
  id: string;
  receipt_number: string;
  received_by: string | null;
  received_at: string | null;
  notes?: string | null;
  items?: BinTransferReceiptItem[];
}

export interface BinTransferDetailItem {
  id: string;
  item_id: string;
  source_bin_id: string;
  destination_bin_id: string | null;
  qty: number;
  placed_qty: number;
  remaining_qty: number;
  batch_no: string | null;
  serial_no: string | null;
  expired_date: string | null;
  notes: string | null;
  product?: {
    id: string;
    sku: string;
    variant_label?: string | null;
    thumbnail_url?: string | null;
    product?: { id: string; name: string } | null;
  } | null;
  source_bin?: { id: string; bin_final_code: string } | null;
  destination_bin?: { id: string; bin_final_code: string } | null;
}

export interface BinTransferDetail extends BinTransferListItem {
  items: BinTransferDetailItem[];
  receipts?: BinTransferReceiptRef[];
}

interface Paginated<T> {
  data: T[];
  meta?: { total?: number; per_page?: number; current_page?: number };
}

export function useBinTransferCreate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BinTransferPayload) => {
      const res = await fetchClient<{ data: BinTransferDetail }>(
        "/inventory/bin-transfers",
        { method: "POST", data: payload },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Transfer internal berhasil dibuat");
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
      invalidateStockViews(qc);
    },
    onError: (err) => apiError(err, "Gagal membuat transfer"),
  });
}

export function useBinTransfer() {
  return useBinTransferCreate();
}

export interface BinTransferListParams {
  perPage?: number;
  page?: number;
  q?: string;
  status?: BinTransferStatus;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useBinTransferList(params: BinTransferListParams = {}) {
  const key = ["bin-transfers", params] as const;
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.perPage) q.set("per_page", String(params.perPage));
      if (params.page) q.set("page", String(params.page));
      if (params.q) q.set("filter.q", params.q);
      if (params.status) q.set("filter.status", params.status);
      if (params.locationId) q.set("filter.location_id", params.locationId);
      if (params.dateFrom) q.set("filter.date_from", params.dateFrom);
      if (params.dateTo) q.set("filter.date_to", params.dateTo);
      const res = await fetchClient<Paginated<BinTransferListItem>>(
        `/inventory/bin-transfers?${q.toString()}`,
      );
      return res;
    },
    staleTime: 15 * 1000,
  });
}

export function useBinTransferDetail(id: string) {
  return useQuery({
    queryKey: ["bin-transfer", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetchClient<{ data: BinTransferDetail }>(
        `/inventory/bin-transfers/${id}`,
      );
      return res.data;
    },
  });
}

export function useBinTransferItemDelete(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      qty,
    }: {
      itemId: string;
      qty?: number;
    }) => {
      const res = await fetchClient<{ data: BinTransferDetail }>(
        `/inventory/bin-transfers/${id}/items/${itemId}`,
        { method: "DELETE", data: qty != null ? { qty } : undefined },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Baris transfer dikoreksi, stok dikembalikan ke rak asal");
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
      qc.invalidateQueries({ queryKey: ["bin-transfer", id] });
      invalidateStockViews(qc);
    },
    onError: (err) => apiError(err, "Gagal mengoreksi baris transfer"),
  });
}

export interface BinTransferUpdatePayload {
  transfer_date?: string;
  created_by?: string;
  notes?: string | null;
}

export function useBinTransferUpdate(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: BinTransferUpdatePayload) => {
      const res = await fetchClient<{ data: BinTransferDetail }>(
        `/inventory/bin-transfers/${id}`,
        { method: "PATCH", data: payload },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Transfer internal berhasil diperbarui");
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
      qc.invalidateQueries({ queryKey: ["bin-transfer", id] });
    },
    onError: (err) => apiError(err, "Gagal memperbarui transfer internal"),
  });
}

export function usePrintBinTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchClient<{ data: BinTransferDetail }>(
        `/inventory/bin-transfers/${id}/print`,
        { method: "POST" },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
    },
    onError: (err) => apiError(err, "Gagal mencetak transfer"),
  });
}

export function useRevertBinTransferPrint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetchClient<{ data: BinTransferDetail }>(
        `/inventory/bin-transfers/${id}/revert-print`,
        { method: "POST" },
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
    },
    onError: (err) =>
      apiError(err, "Gagal mengembalikan transfer ke Baru Dibuat"),
  });
}

export function useDeleteBinTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await fetchClient<unknown>(`/inventory/bin-transfers/${id}`, {
        method: "DELETE",
      });
      return id;
    },
    onSuccess: () => {
      toast.success("Transfer internal berhasil dihapus");
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
      invalidateStockViews(qc);
    },
    onError: (err) => apiError(err, "Gagal menghapus transfer"),
  });
}

export interface BinTransferReceivePayload {
  received_by?: string;
  notes?: string;
  items: {
    bin_transfer_item_id: string;
    destination_bin_id: string;
    qty: number;
  }[];
}

export function useReceiveBinTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: BinTransferReceivePayload;
    }) => {
      const res = await fetchClient<{ data: BinTransferReceiptRef }>(
        `/inventory/bin-transfers/${id}/receipts`,
        { method: "POST", data: payload },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Penerimaan transfer berhasil disimpan");
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
      qc.invalidateQueries({ queryKey: ["bin-transfer-receipts"] });
      invalidateStockViews(qc);
    },
    onError: (err) => apiError(err, "Gagal menyimpan penerimaan transfer"),
  });
}

export interface BinTransferReceiptListItem {
  id: string;
  receipt_number: string;
  bin_transfer?: {
    id: string;
    transfer_number: string;
    transfer_date: string;
  } | null;
  location?: { id?: string; location_name: string } | null;
  received_by: string | null;
  received_at: string | null;
  notes?: string | null;
  items_count: number;
}

export interface BinTransferReceiptListParams {
  perPage?: number;
  page?: number;
  q?: string;
  locationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useBinTransferReceiptList(
  params: BinTransferReceiptListParams = {},
) {
  const key = ["bin-transfer-receipts", params] as const;
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const q = new URLSearchParams();
      if (params.perPage) q.set("per_page", String(params.perPage));
      if (params.page) q.set("page", String(params.page));
      if (params.q) q.set("filter.q", params.q);
      if (params.locationId) q.set("filter.location_id", params.locationId);
      if (params.dateFrom) q.set("filter.date_from", params.dateFrom);
      if (params.dateTo) q.set("filter.date_to", params.dateTo);
      const res = await fetchClient<Paginated<BinTransferReceiptListItem>>(
        `/inventory/bin-transfer-receipts?${q.toString()}`,
      );
      return res;
    },
    staleTime: 15 * 1000,
  });
}

export interface BinTransferReceiptDetail extends BinTransferReceiptListItem {
  items: BinTransferReceiptItem[];
}

export function useBinTransferReceiptDetail(id: string) {
  return useQuery({
    queryKey: ["bin-transfer-receipt", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await fetchClient<{ data: BinTransferReceiptDetail }>(
        `/inventory/bin-transfer-receipts/${id}`,
      );
      return res.data;
    },
  });
}
