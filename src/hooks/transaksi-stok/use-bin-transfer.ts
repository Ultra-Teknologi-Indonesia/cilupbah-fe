"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { fetchClient } from "@/lib/api-client";
import { LocationBinService } from "@/services/manajemen-rak/location-bin.service";

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

export interface BinTransferItemPayload {
  item_id: string;
  qty: number;
  batch_no?: string;
  serial_no?: string;
  expired_date?: string;
  notes?: string;
}

export interface BinTransferPayload {
  location_id: string;
  source_bin_id: string;
  destination_bin_id: string;
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
  source_bin_id: string;
  destination_bin_id: string;
  created_by: string;
  notes: string | null;
  created_at: string;
  items_count: number;
  location?: { id: string; location_name: string } | null;
  source_bin?: { id: string; bin_final_code: string } | null;
  destination_bin?: { id: string; bin_final_code: string } | null;
}

export interface BinTransferDetailItem {
  id: string;
  item_id: string;
  qty: number;
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
}

export interface BinTransferDetail extends BinTransferListItem {
  items: BinTransferDetailItem[];
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
      toast.success("Pindah bin berhasil");
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
      qc.invalidateQueries({ queryKey: ["inventory"] });
      qc.invalidateQueries({ queryKey: ["posisi-stok"] });
      qc.invalidateQueries({ queryKey: ["monitor-stok"] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal memindahkan stok",
      ),
  });
}

export function useBinTransfer() {
  return useBinTransferCreate();
}

export interface BinTransferListParams {
  perPage?: number;
  page?: number;
  q?: string;
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
      toast.success("Pindah bin berhasil diperbarui");
      qc.invalidateQueries({ queryKey: ["bin-transfers"] });
      qc.invalidateQueries({ queryKey: ["bin-transfer", id] });
    },
    onError: (err) =>
      toast.error(
        (err as { message?: string })?.message || "Gagal memperbarui pindah bin",
      ),
  });
}
