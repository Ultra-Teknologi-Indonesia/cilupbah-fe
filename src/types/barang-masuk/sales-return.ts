export type SalesReturnStatus =
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED"

export interface SalesReturnItem {
  id: string
  sales_return_id: string
  item_id: string
  qty: number
  condition?: string | null
  reason?: string | null
  notes?: string | null
  // BE mengirim relasi `product` (ProductVariant: id, sku) + product.product.name
  product?: {
    id: string
    sku: string
    product?: { id: string; name: string } | null
  } | null
}

export interface SalesReturn {
  id: string
  return_number: string
  order_id: string | null
  location_id: string
  source: "manual" | "marketplace"
  customer_name: string | null
  customer_contact: string | null
  status: SalesReturnStatus
  reason: string | null
  notes: string | null
  created_by: string
  processed_by: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
  order?: { id: string; salesorder_no?: string; customer_name?: string | null } | null
  location?: { id: string; location_name: string } | null
  items: SalesReturnItem[]
}

export interface SalesReturnItemInput {
  item_id: string
  qty: number
  condition?: string
  notes?: string
}

export interface SalesReturnFormData {
  order_id?: string
  location_id: string
  source?: "manual" | "marketplace"
  customer_name?: string
  customer_contact?: string
  reason?: string
  notes?: string
  created_by: string
  items: SalesReturnItemInput[]
}

export interface SalesReturnListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[source]"?: string
  "filter[location_id]"?: string
  "filter[date_from]"?: string
  "filter[date_to]"?: string
  sort?: string
}
