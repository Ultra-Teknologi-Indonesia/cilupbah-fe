export interface MonitorVariationValue {
  label: string | null
  value: string | null
}

export interface MonitorStockRow {
  item_id: string
  sku: string
  product_name: string | null
  variation_values: MonitorVariationValue[]
  thumbnail: string | null
  min_stock: number
  safe_stock: number
  on_hand: number
  on_order: number
  available: number
  qty_to_restock: number
}

export interface MonitorListParams {
  search?: string
  location_id?: string
  category_id?: string
  page?: number
  per_page?: number
}

/** Baris tab analitik penjualan (Tidak Laku / Paling Laku / Perkiraan Habis). */
export interface MonitorAnalyticsRow {
  item_id: string
  sku: string
  product_name: string | null
  variation_values: MonitorVariationValue[]
  thumbnail: string | null
  on_hand: number
  on_order: number
  available: number
  last_sold: string | null
  qty_sold: number
  days_idle: number | null
  avg_per_day: number | null
  days_to_out: number | null
  estimated_date: string | null
}

export interface MonitorAnalyticsParams extends MonitorListParams {
  /** Tidak Laku: ambang idle hari. Paling Laku & Perkiraan Habis: window hari. */
  days?: number
  /** Perkiraan Habis: window hari rata-rata penjualan. */
  window?: number
  /** Perkiraan Habis: tampilkan bila days_to_out <= threshold. */
  threshold?: number
}

export type OutOfStockMode = "habis" | "minus" | "dipesan"

export interface MonitorSummary {
  habis: number
  minus: number
  dipesan: number
  menipis: number
  on_order: number
}

/** Baris tab Gagal Sync (ProductChannelMapping failed). */
export interface MonitorSyncFailedRow {
  id: string
  product_id: string
  channel_shop_id: string
  product_name: string | null
  sku: string | null
  thumbnail: string | null
  channel_name: string | null
  shop_name: string | null
  sync_status: string
  error_message: string | null
  last_synced_at: string | null
  external_product_id: string | null
}

export interface FailedSyncParams {
  search?: string
  channel_shop_id?: string
  page?: number
  per_page?: number
}

/** Tab utama Monitor Stok. */
export type MonitorTab =
  | "stok-kosong"
  | "menipis"
  | "tidak-laku"
  | "paling-laku"
  | "perkiraan-habis"
  | "sedang-dibeli"
  | "gagal-sync"
