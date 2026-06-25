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
  reason: string | null
  variant?: {
    id: string
    sku: string
    item_name: string
    variation_values: { label: string; value: string }[]
  }
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
  order?: { id: string; order_number: string }
  location?: { id: string; location_name: string }
  items: SalesReturnItem[]
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
