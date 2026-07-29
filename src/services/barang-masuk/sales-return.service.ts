import { fetchBlob, fetchClient } from "@/lib/api-client";
import type { ApiResponse, ApiPaginated } from "@/types/api.types";
import type {
  SalesReturn,
  SalesReturnAppeal,
  SalesReturnListParams,
  SalesReturnFormData,
} from "@/types/barang-masuk/sales-return";

export const SalesReturnService = {
  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}`,
    );
    return res.data;
  },

  create: async (data: SalesReturnFormData) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(`/sales/returns`, {
      method: "POST",
      data,
    });
    return res.data;
  },

  unprocessed: async (params: SalesReturnListParams = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("limit", String(params.per_page));
    if (params["filter[location_id]"])
      sp.set("filter[location_id]", params["filter[location_id]"]);
    if (params["filter[reason_category]"])
      sp.set("filter[reason_category]", params["filter[reason_category]"]);
    if (params["filter[date_from]"])
      sp.set("filter[date_from]", params["filter[date_from]"]);
    if (params["filter[date_to]"])
      sp.set("filter[date_to]", params["filter[date_to]"]);
    if (params.sort) sp.set("sort", params.sort);

    const res = await fetchClient<ApiPaginated<SalesReturn>>(
      `/sales/returns/unprocessed?${sp}`,
    );
    return { items: res.data ?? [], meta: res.meta };
  },

  list: async (params: SalesReturnListParams = {}) => {
    const sp = new URLSearchParams();
    if (params.search) sp.set("search", params.search);
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("limit", String(params.per_page));
    if (params["filter[status]"])
      sp.set("filter[status]", params["filter[status]"]);
    if (params["filter[source]"])
      sp.set("filter[source]", params["filter[source]"]);
    if (params["filter[location_id]"])
      sp.set("filter[location_id]", params["filter[location_id]"]);
    if (params["filter[reason_category]"])
      sp.set("filter[reason_category]", params["filter[reason_category]"]);
    if (params["filter[date_from]"])
      sp.set("filter[date_from]", params["filter[date_from]"]);
    if (params["filter[date_to]"])
      sp.set("filter[date_to]", params["filter[date_to]"]);
    if (params.sort) sp.set("sort", params.sort);

    const res = await fetchClient<ApiPaginated<SalesReturn>>(
      `/sales/returns?${sp}`,
    );
    return { items: res.data ?? [], meta: res.meta };
  },

  accept: async (
    id: string,
    data: {
      processed_by: string;
      items?: { item_id: string; approved_qty: number }[];
    },
  ) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/accept`,
      {
        method: "POST",
        data,
      },
    );
    return res.data;
  },

  reject: async (
    id: string,
    data: { processed_by: string; reason?: string },
  ) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/reject`,
      {
        method: "POST",
        data,
      },
    );
    return res.data;
  },

  complete: async (id: string, data: { processed_by: string }) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/complete`,
      {
        method: "POST",
        data,
      },
    );
    return res.data;
  },

  syncTracking: async (id: string) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/sync-tracking`,
      {
        method: "POST",
      },
    );
    return res.data;
  },

  syncDetail: async (id: string) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/sync-detail`,
      {
        method: "POST",
      },
    );
    return res.data;
  },

  getAppeals: async (id: string) => {
    const res = await fetchClient<ApiResponse<SalesReturnAppeal[]>>(
      `/sales/returns/${id}/appeals`,
    );
    return res.data ?? [];
  },

  channelAccept: async (id: string) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/channel-accept`,
      {
        method: "POST",
      },
    );
    return res.data;
  },

  channelReject: async (
    id: string,
    data: { reason_id: string; note?: string },
  ) => {
    const res = await fetchClient<ApiResponse<SalesReturn>>(
      `/sales/returns/${id}/channel-reject`,
      {
        method: "POST",
        data,
      },
    );
    return res.data;
  },

  getChannelRejectReasons: async (id: string) => {
    const res = await fetchClient<
      ApiResponse<{ id: string; text: string }[]>
    >(`/sales/returns/${id}/channel-reject-reasons`);
    return res.data ?? [];
  },

  exportChannelOnline: (params: {
    date_from?: string;
    date_to?: string;
    location_id?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params.date_from) sp.set("date_from", params.date_from);
    if (params.date_to) sp.set("date_to", params.date_to);
    if (params.location_id) sp.set("location_id", params.location_id);
    const filename = `retur-channel-online-${params.date_from ?? "hari-ini"}-${params.date_to ?? "now"}.xlsx`;
    return fetchBlob(
      `/sales/returns/channel-online/export?${sp}`,
      filename,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  },
};
