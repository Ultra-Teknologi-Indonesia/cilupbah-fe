export type PutawayStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export interface PutawayItem {
  id: string
  putaway_id: string
  item_id: string
  source_bin_id: string | null
  destination_bin_id: string | null
  qty: number
  putaway_qty: number
  batch_no: string | null
  serial_no: string | null
  variant?: {
    id: string
    sku: string
    item_name: string
    variation_values: { label: string; value: string }[]
  }
  product?: {
    id: string
    sku: string
    product_id: string
    product?: { id: string; name: string }
    options?: { id: string; variant_id: string; value: string }[]
    media?: { id: number; url: string }[]
  }
  source_bin?: { id: string; bin_final_code: string } | null
  destination_bin?: { id: string; bin_final_code: string } | null
  placements?: { id: string; putaway_item_id: string; bin_id: string; qty: number; bin?: { id: string; bin_final_code: string } }[]
}

export interface Putaway {
  id: string
  putaway_no: string
  location_id: string
  source_type: string | null
  source_id: string | null
  status: PutawayStatus
  assigned_to: string | null
  assigned_by: string | null
  started_at: string | null
  completed_at: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  location?: { id: string; location_name: string }
  assignee?: { id: string; name: string }
  creator?: { id: string; name: string }
  inbound?: { id: string; reference_number: string; transaction_number?: string; created_at: string }
  items: PutawayItem[]
}

export interface PutawayListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[location_id]"?: string
  "filter[date_from]"?: string
  "filter[date_to]"?: string
  sort?: string
}
