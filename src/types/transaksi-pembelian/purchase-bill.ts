export interface PurchaseBillItem {
  id: string
  purchase_order_item_id: string | null
  item_id: string
  product?: { id: string; name: string; sku: string }
  description: string | null
  unit: string | null
  qty: number
  unit_price: number
  disc: number
  disc_amount: number
  tax_id: string | null
  tax_amount: number
  amount: number
}

export interface PurchaseBill {
  id: string
  bill_number: string
  purchase_order_id: string | null
  purchase_order?: { id: string; po_number: string } | null
  contact_id: string
  contact?: { id: string; name: string; code: string }
  location_id: string
  location?: { id: string; location_name: string }
  status: PurchaseBillStatus
  bill_date: string
  due_date: string | null
  ref_no: string | null
  payment_term: number | null
  is_tax_included: boolean
  sub_total: number
  total_disc: number
  total_tax: number
  total_amount: number
  paid_amount: number
  tag: string | null
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  items: PurchaseBillItem[]
}

export type PurchaseBillStatus =
  | "DRAFT"
  | "OPEN"
  | "PARTIAL"
  | "PAID"
  | "CANCELLED"

export interface PurchaseBillListParams {
  search?: string
  page?: number
  per_page?: number
  sort?: string
  "filter[status]"?: string
  "filter[contact_id]"?: string
  "filter[location_id]"?: string
  "filter[date_from]"?: string
  "filter[date_to]"?: string
}

export interface PurchaseBillItemFormData {
  item_id: string
  purchase_order_item_id?: string
  product_name?: string
  product_sku?: string
  description?: string
  unit?: string
  qty: number
  unit_price: number
  disc: number
  tax_id?: string
  tax_amount?: number
}

export interface PurchaseBillFormData {
  purchase_order_id?: string
  contact_id: string
  location_id: string
  bill_date: string
  due_date?: string
  ref_no?: string
  payment_term?: number | null
  is_tax_included?: boolean
  tag?: string
  notes?: string
  payment_amount?: number
  payment_account_id?: string
  items: PurchaseBillItemFormData[]
}
