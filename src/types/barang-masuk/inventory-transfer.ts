export type InventoryTransferStatus =
  | "DRAFT"
  | "APPROVED"
  | "IN_TRANSIT"
  | "RECEIVED"
  | "CANCELLED"

export interface InventoryTransferItem {
  id: string
  inventory_transfer_id: string
  item_id: string
  qty: number
  received_qty: number
  variant?: {
    id: string
    sku: string
    item_name: string
    variation_values: { label: string; value: string }[]
  }
}

export interface InventoryTransfer {
  id: string
  transfer_number: string
  receive_number: string | null
  source_location_id: string
  destination_location_id: string
  status: InventoryTransferStatus
  notes: string | null
  created_by: string
  approved_by: string | null
  assigned_to: string | null
  received_by: string | null
  shipped_at: string | null
  approved_at: string | null
  received_at: string | null
  created_at: string
  updated_at: string
  source_location?: { id: string; location_name: string }
  destination_location?: { id: string; location_name: string }
  items: InventoryTransferItem[]
}

export interface InventoryTransferListParams {
  search?: string
  page?: number
  per_page?: number
  "filter[status]"?: string
  "filter[source_location_id]"?: string
  "filter[destination_location_id]"?: string
  "filter[date_from]"?: string
  "filter[date_to]"?: string
  sort?: string
}
