export interface StockAdjustmentItem {
  id: string
  stock_adjustment_id: string
  item_id: string
  bin_id: string | null
  system_qty: number
  actual_qty: number
  difference_qty: number
  notes: string | null
  product?: {
    id: string
    sku: string
    product_id: string
    product?: {
      id: string
      name: string
    }
  }
  bin?: {
    id: string
    bin_final_code: string
  } | null
}

export interface StockAdjustment {
  id: string
  adjustment_no: string
  transaction_date: string
  location_id: string
  is_beginning_balance: boolean
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  location?: {
    id: string
    location_name: string
  }
  items?: StockAdjustmentItem[]
}

export interface StockAdjustmentListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[location_id]"?: string
  sort?: string
}

export interface StockAdjustmentItemInput {
  item_id: string
  bin_id?: string
  actual_qty: number
  unit_cost?: number
  notes?: string
}

export interface StockAdjustmentFormData {
  transaction_date: string
  location_id: string
  adjustment_no?: string
  is_beginning_balance?: boolean
  notes?: string
  created_by: string
  items: StockAdjustmentItemInput[]
}
