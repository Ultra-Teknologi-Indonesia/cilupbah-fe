import { fetchClient } from "@/lib/api-client"
import type { ApiPaginated, ApiResponse } from "@/types/api.types"
import type { Order, OrderListParams, OrderTabCounts } from "@/types/pesanan/order"

export const OrderService = {
  list: (params: OrderListParams) => {
    const sp = new URLSearchParams()
    if (params.tab && params.tab !== "all") sp.set("tab", params.tab)
    if (params.q) sp.set("q", params.q)
    if (params.search_by) sp.set("search_by", params.search_by)
    if (params.channel) sp.set("channel", params.channel)
    if (params.store_id) sp.set("store_id", params.store_id)
    if (params.location_id) sp.set("location_id", params.location_id)
    if (params.content_type) sp.set("content_type", params.content_type)
    if (params.date_from) sp.set("date_from", params.date_from)
    if (params.date_to) sp.set("date_to", params.date_to)
    if (params.page) sp.set("page", String(params.page))
    if (params.per_page) sp.set("per_page", String(params.per_page))
    if (params.sort_by) sp.set("sort_by", params.sort_by)
    if (params.sort_dir) sp.set("sort_dir", params.sort_dir)

    return fetchClient<ApiPaginated<Order>>(`/sales?${sp}`)
  },

  getById: (id: string) => {
    return fetchClient<ApiResponse<Order>>(`/sales/${id}?include=items`)
  },

  getCounts: () => {
    return fetchClient<ApiResponse<OrderTabCounts>>("/sales/counts")
  },

  setPaid: (orderId: string, data?: { payment_method?: string }) => {
    return fetchClient<ApiResponse>("/sales/orders/set-as-paid", {
      method: "POST",
      data: { order_id: orderId, ...data },
    })
  },

  cancelOrder: (orderId: string, reason?: string) => {
    return fetchClient<ApiResponse>(`/sales/${orderId}`, {
      method: "PUT",
      data: { status: "cancelled", cancel_reason: reason },
    })
  },

  saveAirwaybill: (orderId: string, trackingNumber: string, provider?: string) => {
    return fetchClient<ApiResponse>("/sales/orders/save-airwaybill", {
      method: "POST",
      data: { order_id: orderId, tracking_number: trackingNumber, shipping_provider: provider },
    })
  },

  markAsComplete: (orderIds: string[]) => {
    return fetchClient<ApiResponse>("/sales/orders/mark-as-complete", {
      method: "POST",
      data: { order_ids: orderIds },
    })
  },

  deleteCancelled: (ids: string[]) => {
    return fetchClient<ApiResponse>("/sales/orders/delete-canceled", {
      method: "POST",
      data: { ids },
    })
  },
}
