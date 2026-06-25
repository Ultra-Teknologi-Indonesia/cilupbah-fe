export type PurchaseReturnStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "COMPLETED" | "CANCELLED"

export type PurchaseReturnItemCondition = "GOOD" | "DAMAGE" | "EXPIRED"

export interface PurchaseReturnItem {
  id: string
  purchase_return_id: string
  item_id: string
  qty: number
  unit_price: number
  subtotal: number
  condition: string
  notes: string | null
  product?: {
    id: string
    name: string
    sku: string
  }
}

export interface PurchaseReturn {
  id: string
  return_number: string
  purchase_order_id: string | null
  supplier_id: string
  location_id: string
  status: PurchaseReturnStatus
  return_date: string
  total_amount: number
  reason: string | null
  notes: string | null
  created_by: string
  processed_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
  supplier?: { id: string; name: string; code: string }
  location?: { id: string; location_name: string }
  purchaseOrder?: { id: string; po_number: string } | null
  items: PurchaseReturnItem[]
}

export interface PurchaseReturnListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[supplier_id]"?: string
  "filter[location_id]"?: string
  "filter[date_from]"?: string
  "filter[date_to]"?: string
  sort?: string
}

export interface CreatePurchaseReturnPayload {
  supplier_id: string
  location_id: string
  purchase_order_id?: string
  return_date: string
  reason?: string
  notes?: string
  created_by: string
  items: {
    item_id: string
    qty: number
    unit_price: number
    condition?: string
    notes?: string
  }[]
}
