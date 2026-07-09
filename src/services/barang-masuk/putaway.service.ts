import { fetchClient, fetchBlobRaw, fetchBlobPost } from "@/lib/api-client";
import type { ApiResponse, ApiPaginated } from "@/types/api.types";
import type {
  Putaway,
  PutawayItem,
  PutawayListParams,
} from "@/types/barang-masuk/putaway";

export interface AssignStaffPayload {
  data: { putaway_id: string; assigned_to: number }[];
  performed_by: string;
}

export interface ProcessItemPayload {
  destination_bin_id: string;
  qty: number;
}

export interface BinListItem {
  id: string;
  bin_final_code: string;
  current_qty: number;
}

export interface BinLookupResult {
  id: string;
  location_id: string;
  bin_final_code: string;
  bin_label: string | null;
  is_inbound: boolean;
  current_qty: number;
}

export interface DiscrepancyItem {
  putaway_item_id: string;
  item_id: string;
  qty: number;
  bin_id: string;
  batch_no: string | null;
  serial_no: string | null;
}

export interface CompleteDiscrepancyResult {
  putaway: Putaway;
  discrepancy_items: DiscrepancyItem[];
}

export const PutawayService = {
  list: async (params: PutawayListParams = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set("filter[search]", params.search);
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("limit", String(params.per_page));
    if (params["filter[location_id]"])
      sp.set("filter[location_id]", params["filter[location_id]"]);
    if (params["filter[date_from]"])
      sp.set("filter[date_from]", params["filter[date_from]"]);
    if (params["filter[date_to]"])
      sp.set("filter[date_to]", params["filter[date_to]"]);
    if (params.sort) sp.set("sort", params.sort);

    let endpoint = "/putaway";
    if (params["filter[status]"]) {
      const statusMap: Record<string, string> = {
        NOT_STARTED: "/putaway/not-started",
        IN_PROGRESS: "/putaway/in-progress",
        COMPLETED: "/putaway/completed",
      };
      endpoint = statusMap[params["filter[status]"]] ?? endpoint;
    }

    const res = await fetchClient<ApiPaginated<Putaway>>(`${endpoint}?${sp}`);
    return { items: res.data ?? [], meta: res.meta };
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<Putaway>>(`/putaway/${id}`);
    return res.data;
  },

  getItems: async (id: string, limit = 50) => {
    const res = await fetchClient<ApiPaginated<PutawayItem>>(
      `/putaway/${id}/items?limit=${limit}`,
    );
    return res.data ?? [];
  },

  assignStaff: async (payload: AssignStaffPayload) => {
    const res = await fetchClient<ApiResponse<unknown>>(
      "/putaway/assign-staff",
      {
        method: "POST",
        data: payload,
      },
    );
    return res.data;
  },

  start: async (id: string) => {
    const res = await fetchClient<ApiResponse<Putaway>>(
      `/putaway/${id}/start`,
      {
        method: "POST",
      },
    );
    return res.data;
  },

  processItem: async (
    id: string,
    itemId: string,
    payload: ProcessItemPayload,
  ) => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/putaway/${id}/items/${itemId}/process`,
      {
        method: "POST",
        data: payload,
      },
    );
    return res.data;
  },

  deletePlacement: async (
    id: string,
    itemId: string,
    placementId: string,
    qty?: number,
  ) => {
    const res = await fetchClient<ApiResponse<Putaway>>(
      `/putaway/${id}/items/${itemId}/placements/${placementId}`,
      {
        method: "DELETE",
        data: qty != null ? { qty } : undefined,
      },
    );
    return res.data;
  },

  listBins: async (locationId: string) => {
    const res = await fetchClient<ApiResponse<BinListItem[]>>(
      `/putaway/bins?location_id=${encodeURIComponent(locationId)}`,
    );
    return res.data ?? [];
  },

  lookupBin: async (code: string, locationId: string) => {
    const res = await fetchClient<ApiResponse<BinLookupResult>>(
      `/putaway/bins/lookup?code=${encodeURIComponent(code)}&location_id=${encodeURIComponent(locationId)}`,
    );
    return res.data;
  },

  completeDiscrepancy: async (id: string) => {
    const res = await fetchClient<ApiResponse<CompleteDiscrepancyResult>>(
      `/putaway/${id}/complete-discrepancy`,
      {
        method: "POST",
      },
    );
    return res.data;
  },

  pdf: async (id: string): Promise<Blob> => {
    return fetchBlobRaw(
      `/putaway/${encodeURIComponent(id)}/pdf`,
      "application/pdf",
    );
  },

  bulkPdf: async (ids: string[]): Promise<Blob> => {
    return fetchBlobPost("/putaway/bulk/pdf", { ids }, "application/pdf");
  },

  remove: async (id: string) => {
    const res = await fetchClient<ApiResponse<PutawayDeleteResult>>(
      `/putaway/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    return res.data;
  },

  bulkRemove: async (ids: string[]) => {
    const res = await fetchClient<ApiResponse<PutawayDeleteResult[]>>(
      "/putaway/bulk",
      { method: "DELETE", data: { ids } },
    );
    return res.data;
  },
};

export type PutawayDeleteAction =
  | "unassigned"
  | "reset_not_started"
  | "reset_in_progress";

export interface PutawayDeleteResult {
  id: string;
  action: PutawayDeleteAction;
}
