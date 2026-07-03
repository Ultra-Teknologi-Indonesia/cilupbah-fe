import { fetchBlob, fetchClient } from "@/lib/api-client";
import type { ApiPaginated, ApiResponse } from "@/types/api.types";
import type {
  ContactChannel,
  CustomerDecision,
  Order,
  OrderListParams,
  OrderTabCounts,
} from "@/types/pesanan/order";

export interface UpdateOrderItemData {
  sku?: string;
  description?: string;
  qty_in_base?: number;
  price?: number;
  disc_amount?: number;
  tax_amount?: number;
}

export interface ShippingLabelResult {
  type: "url" | "base64" | "raw";
  url?: string;
  content_type?: string;
  document_base64?: string;
  source: string;
  data?: unknown;

  requires_self_design?: boolean;
}

export const OrderService = {
  list: (params: OrderListParams) => {
    const sp = new URLSearchParams();
    if (params.tab && params.tab !== "all") sp.set("tab", params.tab);
    if (params.sub) sp.set("sub", params.sub);
    if (params.q) sp.set("q", params.q);
    if (params.channel) sp.set("channel", params.channel);
    if (params.store_id) sp.set("store_id", params.store_id);
    if (params.location_id) sp.set("location_id", params.location_id);
    if (params.content_type) sp.set("content_type", params.content_type);
    if (params.date_from) sp.set("date_from", params.date_from);
    if (params.date_to) sp.set("date_to", params.date_to);
    if (params.shipping_provider)
      sp.set("shipping_provider", params.shipping_provider);
    if (params.payment) sp.set("payment", params.payment);
    if (params.label_printed) sp.set("label_printed", params.label_printed);
    if (params.contact_status) sp.set("contact_status", params.contact_status);
    if (params.decision) sp.set("decision", params.decision);
    if (params.page) sp.set("page", String(params.page));
    if (params.per_page) sp.set("per_page", String(params.per_page));
    if (params.sort_by) sp.set("sort_by", params.sort_by);
    if (params.sort_dir) sp.set("sort_dir", params.sort_dir);

    return fetchClient<ApiPaginated<Order>>(`/sales?${sp}`);
  },

  getById: (id: string) => {
    return fetchClient<ApiResponse<Order>>(`/sales/${id}?include=items`);
  },

  getCounts: () => {
    return fetchClient<ApiResponse<OrderTabCounts>>("/sales/counts");
  },

  setPaid: (orderId: string, data?: { payment_method?: string }) => {
    return fetchClient<ApiResponse>("/sales/orders/set-as-paid", {
      method: "POST",
      data: { order_id: orderId, ...data },
    });
  },

  cancelOrder: (orderId: string, reason?: string) => {
    return fetchClient<ApiResponse>(`/sales/${orderId}`, {
      method: "PUT",
      data: { status: "cancelled", cancel_reason: reason },
    });
  },

  saveAirwaybill: (
    orderId: string,
    trackingNumber: string,
    provider?: string,
  ) => {
    return fetchClient<ApiResponse>("/sales/orders/save-airwaybill", {
      method: "POST",
      data: {
        order_id: orderId,
        tracking_number: trackingNumber,
        shipping_provider: provider,
      },
    });
  },

  markAsComplete: (orderIds: string[]) => {
    return fetchClient<ApiResponse>("/sales/orders/mark-as-complete", {
      method: "POST",
      data: { order_ids: orderIds },
    });
  },

  deleteCancelled: (ids: string[]) => {
    return fetchClient<ApiResponse>("/sales/orders/delete-canceled", {
      method: "POST",
      data: { ids },
    });
  },

  moveToReadyToProcess: (orderIds: string[]) => {
    return fetchClient<ApiResponse>("/sales/orders/move-to-ready", {
      method: "POST",
      data: { order_ids: orderIds },
    });
  },

  relocateOrder: (orderId: string, locationId: string) => {
    return fetchClient<ApiResponse>(`/sales/${orderId}/relocate`, {
      method: "PUT",
      data: { location_id: locationId },
    });
  },

  getShippingLabel: (orderId: string, docType?: string) => {
    const sp = new URLSearchParams();
    if (docType) sp.set("doc_type", docType);
    return fetchClient<ApiResponse<ShippingLabelResult>>(
      `/sales/${orderId}/shipping-label?${sp}`,
    );
  },

  acceptCancelRequest: (orderId: string, reason?: string) => {
    return fetchClient<ApiResponse>(`/sales/orders/${orderId}/accept-cancel`, {
      method: "POST",
      data: reason ? { reason } : undefined,
    });
  },

  rejectCancelRequest: (orderId: string, reason?: string) => {
    return fetchClient<ApiResponse>(`/sales/orders/${orderId}/reject-cancel`, {
      method: "POST",
      data: reason ? { reason } : undefined,
    });
  },

  exportCancelled: (params: {
    date_from?: string;
    date_to?: string;
    post_pack_only?: boolean;
    source?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params.date_from) sp.set("date_from", params.date_from);
    if (params.date_to) sp.set("date_to", params.date_to);
    if (params.post_pack_only) sp.set("post_pack_only", "1");
    if (params.source) sp.set("source", params.source);

    const filename = `cancel-orders-${params.date_from ?? "all"}-${params.date_to ?? "now"}.xlsx`;

    return fetchBlob(
      `/sales/orders/cancelled/export?${sp}`,
      filename,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  },

  saveReceivedDate: (orderId: string, receivedDate?: string) => {
    return fetchClient<ApiResponse>("/sales/orders/save-received-date", {
      method: "POST",
      data: { order_id: orderId, received_date: receivedDate },
    });
  },

  requestAwb: (orderId: string, courierCode?: string) => {
    return fetchClient<ApiResponse>("/sales/request-awb-order", {
      method: "POST",
      data: { order_id: orderId, courier_code: courierCode },
    });
  },

  acceptReturn: (returnId: string) => {
    return fetchClient<ApiResponse>(`/sales/returns/${returnId}/accept`, {
      method: "POST",
    });
  },

  rejectReturn: (returnId: string, reason?: string) => {
    return fetchClient<ApiResponse>(`/sales/returns/${returnId}/reject`, {
      method: "POST",
      data: { reason },
    });
  },

  markContacted: (
    orderId: string,
    data?: { channel?: ContactChannel; note?: string },
  ) => {
    return fetchClient<ApiResponse<Order>>(
      `/sales/orders/${orderId}/mark-contacted`,
      {
        method: "POST",
        data: data ?? {},
      },
    );
  },

  bulkMarkContacted: (
    orderIds: string[],
    data?: { channel?: ContactChannel; note?: string },
  ) => {
    return fetchClient<ApiResponse>("/sales/orders/bulk-mark-contacted", {
      method: "POST",
      data: { order_ids: orderIds, ...(data ?? {}) },
    });
  },

  setCustomerDecision: (
    orderId: string,
    decision: CustomerDecision,
    note?: string,
  ) => {
    return fetchClient<ApiResponse<Order>>(
      `/sales/orders/${orderId}/customer-decision`,
      {
        method: "POST",
        data: { decision, note },
      },
    );
  },

  updateOrderItem: (
    orderId: string,
    itemId: string,
    data: UpdateOrderItemData,
  ) => {
    return fetchClient<ApiResponse<Order>>(
      `/sales/orders/${orderId}/items/${itemId}`,
      {
        method: "PATCH",
        data,
      },
    );
  },

  deleteOrderItem: (orderId: string, itemId: string) => {
    return fetchClient<ApiResponse<Order>>(
      `/sales/orders/${orderId}/items/${itemId}`,
      {
        method: "DELETE",
      },
    );
  },
};
