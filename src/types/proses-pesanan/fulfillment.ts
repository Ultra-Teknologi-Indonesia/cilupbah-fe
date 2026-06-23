// Tipe untuk Gudang > Proses Pesanan (alur fulfillment: picking → packing → shipping).
// Unit data berbeda dari Penjualan: di sini barisnya picklist/packlist/shipment.

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

// ── Parameter list ───────────────────────────────────────────────────────────
export interface FulfillmentListParams {
  sub?: string | null
  q?: string
  location_id?: string
  courier?: string
  page?: number
  per_page?: number
}

// ── Picklist ─────────────────────────────────────────────────────────────────
export interface RawPicklist {
  id: string
  picklist_no: string
  location_id?: string | null
  location_name?: string | null
  picker_id?: string | null
  picker_name?: string | null
  wave_name?: string | null
  total_orders?: number
  total_qty?: number
  duration_minutes?: number | null
  progress_done?: number
  progress_total?: number
  status?: string | null
}

export interface Picklist {
  id: string
  picklistNo: string
  locationId: string | null
  locationName: string | null
  pickerId: string | null
  pickerName: string | null
  waveName: string | null
  totalOrders: number
  totalQty: number
  durationMinutes: number | null
  progressDone: number
  progressTotal: number
  status: string | null
}

// ── Packlist ─────────────────────────────────────────────────────────────────
export interface RawPacklist {
  id: string
  packlist_no: string
  location_id?: string | null
  location_name?: string | null
  packer_id?: string | null
  packer_name?: string | null
  total_orders?: number
  total_qty?: number
  status?: string | null
}

export interface Packlist {
  id: string
  packlistNo: string
  locationId: string | null
  locationName: string | null
  packerId: string | null
  packerName: string | null
  totalOrders: number
  totalQty: number
  status: string | null
}

// ── Shipment ─────────────────────────────────────────────────────────────────
export interface RawShipment {
  id: string
  shipment_no: string
  courier_code?: string | null
  courier_name?: string | null
  type?: string | null
  total_orders?: number
  status?: string | null
  scheduled_at?: string | null
}

export interface Shipment {
  id: string
  shipmentNo: string
  courierCode: string | null
  courierName: string | null
  type: string | null
  totalOrders: number
  status: string | null
  scheduledAt: string | null
}
