import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type { InventoryTransfer, InventoryTransferListParams } from "@/types/barang-masuk/inventory-transfer"

export interface CreateTransferDraftPayload {
  source_location_id: string
  destination_location_id: string
  notes?: string
  created_by: string
}

export interface AddTransferItemPayload {
  item_id: string
  qty: number
  source_bin_id?: string
  batch_no?: string
  serial_no?: string
}

export const OutboundTransferService = {
  listDrafts: async (params: InventoryTransferListParams = {}) => {
    const sp = buildParams(params)
    const res = await fetchClient<ApiPaginated<InventoryTransfer>>(`/v1/inventory/transfers/drafts?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  listApproved: async (params: InventoryTransferListParams = {}) => {
    const sp = buildParams(params)
    const res = await fetchClient<ApiPaginated<InventoryTransfer>>(`/v1/inventory/transfers/approved?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  listTransit: async (params: InventoryTransferListParams = {}) => {
    const sp = buildParams(params)
    const res = await fetchClient<ApiPaginated<InventoryTransfer>>(`/v1/inventory/transfers/transit?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  listFinished: async (params: InventoryTransferListParams = {}) => {
    const sp = buildParams(params)
    const res = await fetchClient<ApiPaginated<InventoryTransfer>>(`/v1/inventory/transfers/out-finished?${sp}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<InventoryTransfer>>(`/v1/inventory/transfers/${id}`)
    return res.data
  },

  createDraft: async (data: CreateTransferDraftPayload) => {
    const res = await fetchClient<ApiResponse<InventoryTransfer>>("/v1/inventory/transfers/draft", {
      method: "POST",
      data,
    })
    return res.data
  },

  updateDraft: async (id: string, data: Partial<CreateTransferDraftPayload>) => {
    const res = await fetchClient<ApiResponse<InventoryTransfer>>(`/v1/inventory/transfers/${id}`, {
      method: "PATCH",
      data,
    })
    return res.data
  },

  addItem: async (id: string, data: AddTransferItemPayload) => {
    const res = await fetchClient<ApiResponse<unknown>>(`/v1/inventory/transfers/${id}/items`, {
      method: "POST",
      data,
    })
    return res.data
  },

  updateItem: async (id: string, itemId: string, data: { qty: number }) => {
    const res = await fetchClient<ApiResponse<unknown>>(`/v1/inventory/transfers/${id}/items/${itemId}`, {
      method: "PATCH",
      data,
    })
    return res.data
  },

  removeItem: async (id: string, itemId: string) => {
    const res = await fetchClient<ApiResponse<unknown>>(`/v1/inventory/transfers/${id}/items/${itemId}`, {
      method: "DELETE",
    })
    return res.data
  },

  approve: async (id: string, data: { approved_by: string; assigned_to?: number }) => {
    const res = await fetchClient<ApiResponse<InventoryTransfer>>(`/v1/inventory/transfers/${id}/approve`, {
      method: "POST",
      data,
    })
    return res.data
  },

  ship: async (id: string, data: { shipped_by: string }) => {
    const res = await fetchClient<ApiResponse<InventoryTransfer>>(`/v1/inventory/transfers/${id}/ship`, {
      method: "POST",
      data,
    })
    return res.data
  },

  cancel: async (id: string, data: { cancelled_by: string; cancel_reason?: string }) => {
    const res = await fetchClient<ApiResponse<InventoryTransfer>>(`/v1/inventory/transfers/${id}/cancel`, {
      method: "POST",
      data,
    })
    return res.data
  },

  delete: async (id: string) => {
    const res = await fetchClient<ApiResponse<unknown>>(`/v1/inventory/transfers/${id}`, {
      method: "DELETE",
    })
    return res.data
  },

  markPrinted: async (data: { transfer_id: string; printed_by: string }) => {
    const res = await fetchClient<ApiResponse<unknown>>("/v1/inventory/transfer/mark-printed", {
      method: "POST",
      data,
    })
    return res.data
  },

  getDeliveryNote: async (transferId: string) => {
    const res = await fetchClient<ApiResponse<unknown>>(`/v1/inventory/transfer/delivery?transfer_id=${transferId}`)
    return res.data
  },
}

function buildParams(params: InventoryTransferListParams): URLSearchParams {
  const sp = new URLSearchParams()
  if (params.search) sp.set("filter[search]", params.search)
  if (params.page) sp.set("page", String(params.page))
  if (params.per_page) sp.set("limit", String(params.per_page))
  if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
  if (params["filter[source_location_id]"]) sp.set("filter[source_location_id]", params["filter[source_location_id]"])
  if (params["filter[destination_location_id]"]) sp.set("filter[destination_location_id]", params["filter[destination_location_id]"])
  if (params["filter[date_from]"]) sp.set("filter[date_from]", params["filter[date_from]"])
  if (params["filter[date_to]"]) sp.set("filter[date_to]", params["filter[date_to]"])
  if (params.sort) sp.set("sort", params.sort)
  return sp
}
