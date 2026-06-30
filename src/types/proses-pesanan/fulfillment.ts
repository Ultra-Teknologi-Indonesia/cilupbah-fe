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
export interface RawFulfillmentOrderItem {
  id: string
  sku: string
  description: string
  qty_in_base: number
  image_url?: string | null
}

export interface RawFulfillmentOrder {
  id: string
  salesorder_no: string
  channel_order_no?: string | null
  channel_buyer_id?: string | null
  customer_name?: string | null
  shipping_full_name?: string | null
  source?: string | null
  status?: string | null
  is_paid?: boolean
  transaction_date?: string | null
  grand_total?: number | null
  actual_shipping_fee?: number | null
  order_weight_gram?: number | null
  location_id?: string | null
  location_name?: string | null
  location?: { id: string; location_name: string; location_code: string } | null
  tracking_number?: string | null
  shipping_provider?: string | null
  is_cod?: boolean
  priority_fulfillment?: boolean
  is_split_order?: boolean
  cancel_by?: string | null
  fulfillment_flag?: string | null
  days_to_ship?: number | null
  ship_by_date?: string | null
  pickup_done_time?: string | null
  dropshipper_name?: string | null
  dropshipper_phone?: string | null
  total_qty?: number | null
  total_sku?: number | null
  items?: RawFulfillmentOrderItem[] | null
}

export interface FulfillmentOrderItem {
  id: string
  sku: string
  description: string
  qty: number
  imageUrl: string | null
}

export interface FulfillmentOrder {
  id: string
  salesorderNo: string
  channelOrderNo: string | null
  channelBuyerId: string | null
  customerName: string | null
  source: string | null
  status: string | null
  isPaid: boolean
  transactionDate: string | null
  grandTotal: number
  actualShippingFee: number | null
  orderWeightGram: number | null
  locationId: string | null
  locationName: string | null
  trackingNumber: string | null
  shippingProvider: string | null
  isCod: boolean
  priorityFulfillment: boolean
  isSplitOrder: boolean
  cancelBy: string | null
  fulfillmentFlag: string | null
  daysToShip: number | null
  shipByDate: string | null
  pickupDoneTime: string | null
  dropshipperName: string | null
  dropshipperPhone: string | null
  totalQty: number | null
  totalSku: number | null
  items: FulfillmentOrderItem[]
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

// ── Picklist detail + item (untuk layar scan/pick) ───────────────────────────
export interface RawPicklistMedia {
  id?: string
  url?: string | null
  is_primary?: boolean | null
  sort_order?: number | null
}

export interface RawPicklistItem {
  id: string
  sku: string
  item_id?: string | null
  order_id?: string | null
  bin_id?: string | null
  qty_ordered?: number
  qty_picked?: number
  status?: string | null
  /** Accessor `image_url` di-append oleh PicklistItem model (BE). */
  image_url?: string | null
  product?: {
    sku?: string | null
    barcode?: string | null
    variant_name?: string | null
    image_url?: string | null
    media?: RawPicklistMedia[] | null
    product?: {
      name?: string | null
      image_url?: string | null
      media?: RawPicklistMedia[] | null
    } | null
  } | null
  bin?: { bin_final_code?: string | null; bin_code?: string | null } | null
  order?: {
    salesorder_no?: string | null
    tracking_number?: string | null
    package_no?: string | null
    shipment_no?: string | null
  } | null
  orderItem?: {
    description?: string | null
    image_url?: string | null
    variant_name?: string | null
  } | null
}

export interface PicklistItem {
  id: string
  sku: string
  name: string | null
  variantName: string | null
  imageUrl: string | null
  binCode: string | null
  orderNo: string | null
  trackingNumber: string | null
  packageNo: string | null
  itemStatus: string | null
  qtyOrdered: number
  qtyPicked: number
}

export interface RawPicklistDetail extends RawPicklist {
  items?: RawPicklistItem[]
}

export interface PicklistDetail extends Picklist {
  items: PicklistItem[]
}

// ── Packlist (per-order; envelope {success, data: paginator}) ────────────────
export type PacklistStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export interface RawPacklist {
  id: string
  packlist_no: string
  location_id?: string | null
  packer_id?: string | null
  order_id?: string | null
  status?: string | null
  package_count?: number
  location?: { id: string; location_name?: string | null } | null
  packer?: { id: string; name?: string | null; email?: string | null } | null
  order?: { id: string; salesorder_no?: string | null; customer_name?: string | null } | null
}

export interface Packlist {
  id: string
  packlistNo: string
  locationId: string | null
  locationName: string | null
  packerId: string | null
  packerName: string | null
  orderNo: string | null
  customerName: string | null
  status: PacklistStatus
  packageCount: number
}

export interface RawPacklistItem {
  id: string
  sku: string
  item_id?: string | null
  qty_ordered?: number
  qty_packed?: number
  barcode_verified?: boolean
  product?: {
    sku?: string | null
    product_id?: string | null
    media?: RawPicklistMedia[] | null
    product?: { name?: string | null; media?: RawPicklistMedia[] | null } | null
  } | null
  orderItem?: {
    sku?: string | null
    description?: string | null
    product?: {
      sku?: string | null
      product_id?: string | null
      media?: RawPicklistMedia[] | null
      product?: { name?: string | null; media?: RawPicklistMedia[] | null } | null
    } | null
  } | null
}

export interface PacklistItem {
  id: string
  sku: string
  description: string | null
  imageUrl: string | null
  qtyOrdered: number
  qtyPacked: number
  barcodeVerified: boolean
}

export interface RawPacklistDetail extends RawPacklist {
  items?: RawPacklistItem[]
}

export interface PacklistDetail extends Packlist {
  items: PacklistItem[]
}

export const PACKLIST_STATUS_LABEL: Record<PacklistStatus, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "Diproses", className: "bg-blue-500/10 text-blue-600" },
  COMPLETED: { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" },
  CANCELLED: { label: "Dibatalkan", className: "bg-muted text-muted-foreground" },
}

// ── Shipment (envelope {success, data: paginator}) ───────────────────────────
export type ShipmentStatus =
  | "SCHEDULED"
  | "HANDED_OVER"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CANCELLED"

export type ShipmentType = "REGULAR" | "EXPRESS" | "SAME_DAY" | "CARGO" | "INSTANT"

export const SHIPMENT_TYPES: { value: ShipmentType; label: string }[] = [
  { value: "REGULAR", label: "Reguler" },
  { value: "EXPRESS", label: "Express" },
  { value: "SAME_DAY", label: "Same Day" },
  { value: "CARGO", label: "Cargo" },
  { value: "INSTANT", label: "Instant" },
]

export interface RawShipment {
  id: string
  shipment_no: string
  location_id?: string | null
  location?: { id: string; location_name?: string | null } | null
  courier_code?: string | null
  courier_name?: string | null
  shipment_type?: string | null
  shipment_date?: string | null
  status?: string | null
  handed_over_at?: string | null
  orders_count?: number
}

export interface Shipment {
  id: string
  shipmentNo: string
  locationId: string | null
  locationName: string | null
  courierCode: string | null
  courierName: string | null
  shipmentType: string | null
  shipmentDate: string | null
  status: ShipmentStatus
  handedOverAt: string | null
  ordersCount: number
}

export const SHIPMENT_STATUS_LABEL: Record<ShipmentStatus, { label: string; className: string }> = {
  SCHEDULED: { label: "Terjadwal", className: "bg-blue-500/10 text-blue-600" },
  HANDED_OVER: { label: "Diserahkan", className: "bg-amber-500/10 text-amber-600" },
  IN_TRANSIT: { label: "Dikirim", className: "bg-indigo-500/10 text-indigo-600" },
  DELIVERED: { label: "Terkirim", className: "bg-emerald-500/10 text-emerald-600" },
  CANCELLED: { label: "Dibatalkan", className: "bg-muted text-muted-foreground" },
}

// ── Courier ──────────────────────────────────────────────────────────────────
export interface RawCourier {
  id: string
  name?: string | null
  code?: string | null
  type?: string | null
  logo_url?: string | null
  is_active?: boolean
}

export interface Courier {
  id: string
  name: string
  code: string | null
  type: string | null
  logoUrl: string | null
  isActive: boolean
}
