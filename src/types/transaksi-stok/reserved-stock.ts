export interface ReservedStockItem {
  id: string
  reserved_stock_id: string
  item_id: string
  bin_id: string | null
  qty: number
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

export interface ReservedStock {
  id: string
  reserved_stock_no: string
  location_id: string
  start_date: string
  end_date: string
  status: "ACTIVE" | "CANCELLED"
  is_active: boolean
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  location?: {
    id: string
    location_name: string
  }
  items?: ReservedStockItem[]
}

export interface ReservedStockListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[location_id]"?: string
  sort?: string
}

export interface ReservedStockItemInput {
  item_id: string
  bin_id?: string
  qty: number
}

export interface ReservedStockFormData {
  location_id: string
  start_date: string
  end_date: string
  is_active?: boolean
  notes?: string
  created_by: string
  items: ReservedStockItemInput[]
}
