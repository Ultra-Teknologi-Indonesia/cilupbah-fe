export interface StockOpnameItem {
  id: string
  stock_opname_id: string
  item_id: string
  bin_id: string | null
  batch_no: string | null
  serial_no: string | null
  expired_date: string | null
  qty_system: number
  qty_actual: number | null
  qty_difference: number | null
  reason: string | null
  counted_by: string | null
  counted_at: string | null
  item?: {
    id: string
    item_name: string
    sku: string
  }
  bin?: {
    id: string
    code: string
  } | null
}

export interface StockOpname {
  id: string
  opname_no: string
  location_id: string
  filter_zone_id: string | null
  filter_floor_codes: string[] | null
  filter_row_codes: string[] | null
  filter_column_codes: string[] | null
  status: "DRAFT" | "IN_PROGRESS" | "FINALIZED" | "CANCELLED"
  notes: string | null
  created_by: string
  process_by: string | null
  finalized_by: string | null
  finalized_at: string | null
  printed_by: string | null
  printed_at: string | null
  created_at: string
  updated_at: string
  location?: {
    id: string
    location_name: string
  }
  items?: StockOpnameItem[]
  items_count?: number
  counted_count?: number
}

export interface StockOpnameListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[location_id]"?: string
  sort?: string
}

export interface StockOpnameFormData {
  location_id: string
  filter_zone_id?: string
  filter_floor_codes?: string[]
  filter_row_codes?: string[]
  filter_column_codes?: string[]
  notes?: string
  created_by: string
}
