export interface StockRevaluationItem {
  id: string
  stock_revaluation_id: string
  item_id: string
  bin_id: string | null
  qty: number
  old_cost: number
  new_cost: number
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

export interface StockRevaluation {
  id: string
  revaluation_no: string
  location_id: string
  status: "APPROVED" | "CANCELLED"
  notes: string | null
  created_by: string
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  location?: {
    id: string
    location_name: string
  }
  items?: StockRevaluationItem[]
}

export interface StockRevaluationListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[location_id]"?: string
  sort?: string
}

export interface StockRevaluationItemInput {
  item_id: string
  bin_id?: string
  new_cost: number
}

export interface StockRevaluationFormData {
  location_id: string
  notes?: string
  created_by: string
  items: StockRevaluationItemInput[]
}
