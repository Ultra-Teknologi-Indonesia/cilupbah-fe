export type InboundType = "PURCHASE_ORDER" | "SALES_RETURN" | "TRANSIT_IN" | "CONSIGNMENT"

export type InboundStatus =
  | "DRAFT"
  | "PARTIAL"
  | "RECEIVED"
  | "PUTAWAY_IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"

export interface InboundReceipt {
  id: string
  inbound_item_id: string
  qty: number
  bin_id: string | null
  batch_no: string | null
  serial_no: string | null
  condition: string | null
  received_by: string
  received_date: string
  bin?: { id: string; code: string }
}

export interface InboundItem {
  id: string
  inbound_id: string
  item_id: string
  expected_qty: number
  received_qty: number
  putaway_qty: number
  discrepancy_qty: number
  discrepancy_note: string | null
  condition: string | null
  variant?: {
    id: string
    sku: string
    item_name: string
    variation_values: { label: string; value: string }[]
  }
  receipts?: InboundReceipt[]
}

export interface InboundAssignment {
  id: string
  inbound_id: string
  assigned_to: string
  assigned_by: string
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED"
  notes: string | null
  started_at: string | null
  completed_at: string | null
  worker?: { id: string; name: string }
  assigner?: { id: string; name: string }
}

export interface Inbound {
  id: string
  location_id: string
  transaction_number: string
  reference_number: string | null
  type: InboundType
  source_type: string | null
  source_id: string | null
  status: InboundStatus
  expected_date: string | null
  created_by: string
  created_at: string
  updated_at: string
  location?: { id: string; location_name: string }
  items: InboundItem[]
  assignments?: InboundAssignment[]
}

export interface InboundListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[type]"?: string
  "filter[location_id]"?: string
  "filter[source_type]"?: string
  "filter[date_from]"?: string
  "filter[date_to]"?: string
  sort?: string
}
