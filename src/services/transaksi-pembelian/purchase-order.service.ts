import { fetchClient, fetchBlobRaw } from "@/lib/api-client";
import type { ApiResponse, ApiPaginated } from "@/types/api.types";
import type {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderListParams,
  PurchaseOrderFormData,
} from "@/types/transaksi-pembelian/purchase-order";

export interface ReceivePOPayload {
  reference_number?: string;
  location_id?: string;
  receive_date?: string;
  notes?: string;
  items: {
    purchase_order_item_id: string;
    qty: number;
    rejected_qty?: number;
    rejection_note?: string;
    notes?: string;
  }[];
}

const buildListParams = (params: PurchaseOrderListParams) => {
  const sp = new URLSearchParams();
  if (params.search) sp.set("filter[search]", params.search);
  if (params.page) sp.set("page", String(params.page));
  if (params.per_page) sp.set("limit", String(params.per_page));
  if (params["filter[status]"])
    sp.set("filter[status]", params["filter[status]"]);
  if (params["filter[contact_id]"])
    sp.set("filter[contact_id]", params["filter[contact_id]"]);
  if (params["filter[location_id]"])
    sp.set("filter[location_id]", params["filter[location_id]"]);
  if (params["filter[date_from]"])
    sp.set("filter[date_from]", params["filter[date_from]"]);
  if (params["filter[date_to]"])
    sp.set("filter[date_to]", params["filter[date_to]"]);
  if (params.sort) sp.set("sort", params.sort);
  return sp;
};

export const PurchaseOrderService = {
  list: async (params: PurchaseOrderListParams = {}) => {
    const sp = buildListParams(params);
    const res = await fetchClient<ApiPaginated<PurchaseOrder>>(
      `/purchase/orders?${sp}`,
    );
    return { items: res.data ?? [], meta: res.meta };
  },

  listReceivable: async (params: PurchaseOrderListParams = {}) => {
    const sp = buildListParams(params);
    const res = await fetchClient<ApiPaginated<PurchaseOrder>>(
      `/purchase/orders/receivable?${sp}`,
    );
    return { items: res.data ?? [], meta: res.meta };
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<PurchaseOrder>>(
      `/purchase/orders/${id}`,
    );
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

    const res = await fetchClient<ApiPaginated<PurchaseOrderItem>>(
      `/purchase/orders/${id}/items`,
      { params: query },
    );
    return res;
  },

  create: async (data: PurchaseOrderFormData) => {
    const res = await fetchClient<ApiResponse<PurchaseOrder>>(
      "/purchase/orders",
      {
        method: "POST",
        data,
      },
    );
    return res.data;
  },

  update: async (id: string, data: PurchaseOrderFormData) => {
    const res = await fetchClient<ApiResponse<PurchaseOrder>>(
      `/purchase/orders/${id}`,
      {
        method: "PUT",
        data,
      },
    );
    return res.data;
  },

  cancel: async (id: string) => {
    const res = await fetchClient<ApiResponse<PurchaseOrder>>(
      `/purchase/orders/${id}/cancel`,
      {
        method: "POST",
      },
    );
    return res.data;
  },

  receive: async (id: string, data: ReceivePOPayload) => {
    const res = await fetchClient<ApiResponse<unknown>>(
      `/purchase/orders/${id}/receive`,
      {
        method: "POST",
        data,
      },
    );
    return res.data;
  },

  bulkDelete: async (ids: string[]) => {
    const res = await fetchClient<ApiResponse<unknown>>(
      "/purchase/orders/bulk-delete",
      {
        method: "POST",
        data: { ids },
      },
    );
    return res.data;
  },

  delete: async (id: string) => {
    await fetchClient(`/purchase/orders/${id}`, {
      method: "DELETE",
    });
  },

  openPdf: async (id: string, poNumber: string) => {
    const blob = await fetchBlobRaw(
      `/purchase/orders/${id}/pdf`,
      "application/pdf",
    );
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      const a = document.createElement("a");
      a.href = url;
      a.download = `PO-${poNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  },
};
