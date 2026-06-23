// Tipe untuk Gudang > Proses Pesanan (alur fulfillment: picking → packing → shipping).
// Unit data berbeda dari Penjualan: di sini barisnya picklist/packlist/shipment/order-per-stage.

export type FulfillmentStage =
  | "picking"
  | "packing"
  | "shipping"
  | "delivered"
  | "done"

export interface StageSub {
  key: string
  label: string
}

export interface StageConfigItem {
  key: FulfillmentStage
  label: string
  subs: StageSub[]
}

export const STAGE_CONFIG: readonly StageConfigItem[] = [
  {
    key: "picking",
    label: "Picking",
    subs: [
      { key: "belum", label: "Belum Mulai" },
      { key: "diproses", label: "Diproses" },
      { key: "selesai", label: "Selesai" },
    ],
  },
  {
    key: "packing",
    label: "Packing",
    subs: [
      { key: "belum", label: "Belum" },
      { key: "diproses", label: "Diproses" },
      { key: "selesai", label: "Selesai" },
    ],
  },
  {
    key: "shipping",
    label: "Shipping",
    subs: [
      { key: "siap-kirim", label: "Siap Kirim" },
      { key: "jadwal", label: "Jadwal Pengiriman" },
    ],
  },
  { key: "delivered", label: "Sudah Dikirim", subs: [] },
  { key: "done", label: "Selesai", subs: [] },
]

export function stageConfig(stage: FulfillmentStage): StageConfigItem | undefined {
  return STAGE_CONFIG.find((s) => s.key === stage)
}

export function defaultSubFor(stage: FulfillmentStage): string | null {
  const cfg = stageConfig(stage)
  return cfg && cfg.subs.length ? cfg.subs[0].key : null
}

// Stage string BE untuk bucket order Picking (lihat OutboundFulfillmentController).
export const PICKING_ORDER_STAGE = {
  belum: "ready-to-process",
  selesai: "finish-pick",
} as const

// ── Parameter list ───────────────────────────────────────────────────────────
export interface FulfillmentListParams {
  sub?: string | null
  q?: string
  location_id?: string
  source?: string
  status?: string
  page?: number
  per_page?: number
}

// ── Order per-stage (baris SalesOrder mentah dari /outbound/orders/{stage}) ────
export interface RawFulfillmentOrder {
  id: string
  salesorder_no: string
  channel_order_no?: string | null
  customer_name?: string | null
  source?: string | null
  status?: string | null
  is_paid?: boolean
  transaction_date?: string | null
  grand_total?: number | null
  location_id?: string | null
  location_name?: string | null
  tracking_number?: string | null
  shipping_provider?: string | null
  total_qty?: number | null
  total_sku?: number | null
}

export interface FulfillmentOrder {
  id: string
  salesorderNo: string
  channelOrderNo: string | null
  customerName: string | null
  source: string | null
  status: string | null
  isPaid: boolean
  transactionDate: string | null
  grandTotal: number
  locationId: string | null
  locationName: string | null
  trackingNumber: string | null
  shippingProvider: string | null
  totalQty: number | null
  totalSku: number | null
}

// ── Picklist (sesuai response BE: model + agregat) ───────────────────────────
export type PicklistStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"

export interface RawPicklist {
  id: string
  picklist_no: string
  location_id?: string | null
  picker_id?: string | null
  status?: string | null
  started_at?: string | null
  completed_at?: string | null
  notes?: string | null
  created_by?: string | null
  created_at?: string | null
  updated_at?: string | null
  items_count?: number
  items_sum_qty_ordered?: number | null
  items_sum_qty_picked?: number | null
  location?: { id: string; location_name?: string | null; location_code?: string | null } | null
  picker?: { id: string; name?: string | null; email?: string | null } | null
}

export interface Picklist {
  id: string
  picklistNo: string
  locationId: string | null
  locationName: string | null
  pickerId: string | null
  pickerName: string | null
  status: PicklistStatus
  startedAt: string | null
  completedAt: string | null
  notes: string | null
  itemsCount: number
  qtyOrdered: number
  qtyPicked: number
}

export const PICKLIST_STATUS_LABEL: Record<PicklistStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "Diproses", className: "bg-blue-500/10 text-blue-600" },
  COMPLETED: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" },
  FAILED: { label: "Gagal", className: "bg-destructive/10 text-destructive" },
  CANCELLED: { label: "Dibatalkan", className: "bg-muted text-muted-foreground" },
}

// ── Picker (warehouse user) ──────────────────────────────────────────────────
export interface RawPicker {
  id: string
  name?: string | null
  email?: string | null
}

export interface Picker {
  id: string
  name: string
  email: string | null
}

// ── Hasil aksi omnichannel "Siap Dikirim" ────────────────────────────────────
export interface RawReadyToShipResult {
  order_id: string
  salesorder_no?: string | null
  source?: string | null
  status?: "success" | "failed" | "skipped" | string
  message?: string | null
}

export interface ReadyToShipResult {
  orderId: string
  salesorderNo: string | null
  source: string | null
  status: "success" | "failed" | "skipped" | string
  message: string | null
}

// ── Packlist & Shipment (fondasi untuk fase berikutnya) ──────────────────────
export interface RawPacklist {
  id: string
  packlist_no: string
  location?: { location_name?: string | null } | null
  packer?: { name?: string | null } | null
  status?: string | null
  items_count?: number
}

export interface Packlist {
  id: string
  packlistNo: string
  locationName: string | null
  packerName: string | null
  status: string | null
  itemsCount: number
}

export interface RawShipment {
  id: string
  shipment_no: string
  courier_code?: string | null
  courier_name?: string | null
  status?: string | null
}

export interface Shipment {
  id: string
  shipmentNo: string
  courierCode: string | null
  courierName: string | null
  status: string | null
}
