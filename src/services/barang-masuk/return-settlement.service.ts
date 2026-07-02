import { fetchClient } from "@/lib/api-client"
import type { ApiResponse, ApiPaginated } from "@/types/api.types"
import type {
  ReturnSettlement,
  ReturnSettlementRefund,
  CreateRefundPayload,
  CreateInvoiceDeductionPayload,
} from "@/types/barang-masuk/return-settlement"

const BASE = "/sales/return-settlements"

export const ReturnSettlementService = {
  list: async (limit = 200) => {
    const res = await fetchClient<ApiPaginated<ReturnSettlement>>(`${BASE}?limit=${limit}`)
    return { items: res.data ?? [], meta: res.meta }
  },

  getById: async (id: string) => {
    const res = await fetchClient<ApiResponse<ReturnSettlement>>(`${BASE}/${id}`)
    return res.data
  },

  create: async (data: { return_id: string; notes?: string }) => {
    const res = await fetchClient<ApiResponse<ReturnSettlement>>(BASE, { method: "POST", data })
    return res.data
  },

  confirm: async (id: string) => {
    const res = await fetchClient<ApiResponse<ReturnSettlement>>(`${BASE}/${id}/confirm`, { method: "POST" })
    return res.data
  },

  complete: async (id: string) => {
    const res = await fetchClient<ApiResponse<ReturnSettlement>>(`${BASE}/${id}/complete`, { method: "POST" })
    return res.data
  },

  remove: async (id: string) => {
    await fetchClient(`${BASE}/${id}`, { method: "DELETE" })
  },

  addRefund: async (data: CreateRefundPayload) => {
    const res = await fetchClient<ApiResponse<ReturnSettlementRefund>>(`${BASE}/refunds`, { method: "POST", data })
    return res.data
  },

  removeRefund: async (id: string) => {
    await fetchClient(`${BASE}/refunds/${id}`, { method: "DELETE" })
  },

  addInvoiceDeduction: async (data: CreateInvoiceDeductionPayload) => {
    const res = await fetchClient<ApiResponse<unknown>>(`${BASE}/invoices`, { method: "POST", data })
    return res.data
  },

  removeInvoiceDeduction: async (id: string) => {
    await fetchClient(`${BASE}/invoices/${id}`, { method: "DELETE" })
  },
}
