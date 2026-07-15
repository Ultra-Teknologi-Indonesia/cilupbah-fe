import { fetchClient, fetchBlobRaw } from "@/lib/api-client";
import type { ApiResponse, ApiPaginated } from "@/types/api.types";
import type {
  Inbound,
  InboundItem,
  InboundListParams,
} from "@/types/barang-masuk/inbound";

export interface ScanPutawayPayload {
  inbound_item_id: string;
  bin_id: string;
  qty: number;
}

export const InboundService = {
  list: async (params: InboundListParams = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("limit", String(params.per_page));
    if (params["filter[status]"])
      sp.set("filter[status]", params["filter[status]"]);
    if (params["filter[type]"]) sp.set("filter[type]", params["filter[type]"]);
    if (params["filter[location_id]"])
      sp.set("filter[location_id]", params["filter[location_id]"]);
    if (params["filter[source_type]"])
      sp.set("filter[source_type]", params["filter[source_type]"]);
    if (params["filter[date_from]"])
      sp.set("filter[date_from]", params["filter[date_from]"]);
    if (params["filter[date_to]"])
      sp.set("filter[date_to]", params["filter[date_to]"]);
    if (params.sort) sp.set("sort", params.sort);

    const res = await fetchClient<ApiPaginated<Inbound>>(`/inbounds?${sp}`);
    return { items: res.data ?? [], meta: res.meta };
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<Inbound>>(`/inbounds/${id}`);
    return res.data;
  },

  getItems: async (
    id: string,
    params: {
      page: number;
      perPage: number;
      search?: string;
      sort?: string;
    },
  ) => {
    const query: Record<string, string | number> = {
      page: params.page,
      per_page: params.perPage,
    };
    if (params.search) query.search = params.search;
    if (params.sort) query.sort = params.sort;

    const res = await fetchClient<ApiPaginated<InboundItem>>(
      `/inbounds/${id}/items`,
      { params: query },
    );
    return res;
  },

  scanPutaway: async (payload: ScanPutawayPayload) => {
    const res = await fetchClient<ApiResponse<unknown>>(
      "/inbounds/scan-putaway",
      {
        method: "POST",
        data: payload,
      },
    );
    return res.data;
  },

  correctReceivedLine: async (
    inboundId: string,
    itemId: string,
    qty?: number,
  ) => {
    const res = await fetchClient<ApiResponse<Inbound>>(
      `/inbounds/${inboundId}/items/${itemId}/received`,
      {
        method: "DELETE",
        data: qty != null ? { qty } : undefined,
      },
    );
    return res.data;
  },

  correctReceivedLines: async (
    inboundId: string,
    items: { item_id: string; qty?: number }[],
  ) => {
    const res = await fetchClient<ApiResponse<Inbound>>(
      `/inbounds/${inboundId}/received`,
      {
        method: "DELETE",
        data: { items },
      },
    );
    return res.data;
  },

  /** Set jumlah diterima aktual pada satu baris (boleh naik/turun).
   *  Kalau expectedUpdatedAt diberikan, BE akan cek optimistic lock (fix H4)
   *  dan throw 412 STALE_WRITE kalau data server sudah berubah. */
  setReceivedQty: async (
    inboundId: string,
    itemId: string,
    qty: number,
    expectedUpdatedAt?: string | null,
  ) => {
    const res = await fetchClient<ApiResponse<Inbound>>(
      `/inbounds/${inboundId}/items/${itemId}/received-qty`,
      {
        method: "PATCH",
        data: expectedUpdatedAt
          ? { qty, _expected_updated_at: expectedUpdatedAt }
          : { qty },
      },
    );
    return res.data;
  },

  /** Batalkan (hapus) beberapa penerimaan sekaligus. */
  bulkCancel: async (ids: string[]) => {
    const res = await fetchClient<
      ApiResponse<{
        cancelled: string[];
        failed: { id: string; message: string }[];
      }>
    >(`/inbounds/bulk-cancel`, {
      method: "POST",
      data: { ids },
    });
    return res.data;
  },

  /** Tombol A "Alihkan Tugas" — TAHAN progress, opsional reassign ke user baru. */
  unassign: async (
    inboundId: string,
    payload: {
      reason_code: string;
      reason_note?: string;
      new_assignee_id?: string;
    },
  ) => {
    const res = await fetchClient<ApiResponse<Inbound>>(
      `/inbounds/${inboundId}/assignment`,
      { method: "DELETE", data: payload },
    );
    return res.data;
  },

  /** Tombol B "Reset & Alihkan" — reverse received_qty ke 0 + audit. */
  resetAssignment: async (
    inboundId: string,
    payload: { reason_note: string; new_assignee_id?: string },
  ) => {
    const res = await fetchClient<ApiResponse<Inbound>>(
      `/inbounds/${inboundId}/assignment/reset`,
      { method: "POST", data: payload },
    );
    return res.data;
  },

  barcodesPdf: async (id: string): Promise<Blob> => {
    return fetchBlobRaw(
      `/inbounds/${encodeURIComponent(id)}/barcodes`,
      "application/pdf",
    );
  },

  pdf: async (id: string): Promise<Blob> => {
    return fetchBlobRaw(
      `/inbounds/${encodeURIComponent(id)}/pdf`,
      "application/pdf",
    );
  },

  /** Fase 2 multi-staff: admin tarik participant dari web. */
  withdrawParticipant: async (
    inboundId: string,
    userId: string,
    reasonNote?: string,
  ) => {
    const res = await fetchClient<ApiResponse<Inbound>>(
      `/inbounds/${inboundId}/participants/${userId}/withdraw`,
      {
        method: "POST",
        data: reasonNote ? { reason_note: reasonNote } : {},
      },
    );
    return res.data;
  },

  /** F5: buat Inbound susulan dari PO (delivery bertahap). */
  receiveAdditional: async (poId: string) => {
    const res = await fetchClient<ApiResponse<Inbound>>(
      `/purchase-orders/${poId}/receive-additional`,
      { method: "POST" },
    );
    return res.data;
  },
};
