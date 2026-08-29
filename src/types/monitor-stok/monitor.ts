export interface MonitorVariationValue {
  label: string | null;
  value: string | null;
}

export interface MonitorStockRow {
  item_id: string;
  sku: string;
  product_name: string | null;
  variation_values: MonitorVariationValue[];
  thumbnail: string | null;
  min_stock: number;
  safe_stock: number;
  on_hand: number;
  on_order: number;
  available: number;
  qty_to_restock: number;
  pending_order_nos?: string | null;
}

export interface MonitorListParams {
  search?: string;
  location_id?: string;
  category_id?: string;
  page?: number;
  per_page?: number;
}

export interface MonitorAnalyticsRow {
  item_id: string;
  sku: string;
  product_name: string | null;
  variation_values: MonitorVariationValue[];
  thumbnail: string | null;
  on_hand: number;
  on_order: number;
  available: number;
  last_sold: string | null;
  qty_sold: number;
  days_idle: number | null;
  avg_per_day: number | null;
  days_to_out: number | null;
  estimated_date: string | null;
}

export interface MonitorAnalyticsParams extends MonitorListParams {
  days?: number;

  window?: number;

  threshold?: number;
}

export type OutOfStockMode = "habis" | "minus" | "dipesan";

export interface MonitorSummary {
  habis: number;
  minus: number;
  dipesan: number;
  menipis: number;
  on_order: number;
}

export interface MonitorSyncFailedRow {
  id: string;
  product_id: string;
  channel_shop_id: string;
  product_name: string | null;
  sku: string | null;
  thumbnail: string | null;
  channel_name: string | null;
  shop_name: string | null;
  sync_status: string;
  error_message: string | null;
  last_synced_at: string | null;
  external_product_id: string | null;
}

export interface FailedSyncParams {
  search?: string;
  channel_shop_id?: string;
  page?: number;
  per_page?: number;
}

export type MonitorTab =
  | "stok-kosong"
  | "menipis"
  | "tidak-laku"
  | "paling-laku"
  | "perkiraan-habis"
  | "sedang-dibeli"
  | "gagal-sync"
  | "kronologi";

export type KronologiView = "clean" | "attention" | "all";

export interface KronologiRow {
  id: string;
  item_id: string;
  sku: string | null;
  product_id: string | null;
  location_id: string;
  location_name: string | null;
  bin_id: string | null;
  bin_code: string | null;
  transaction_number: string | null;
  order_no: string | null;
  source: string;
  source_category: string;
  source_label: string;
  is_variance: boolean;
  direction: "in" | "out" | "none";
  qty: number;
  balance: number;
  current_balance?: number;
  current_available_balance?: number;
  transaction_date: string;
  created_by: string | null;
  created_at: string;
}

export interface KronologiParams {
  view?: KronologiView;
  search?: string;
  item_id?: string;
  location_id?: string;
  source?: string;
  direction?: "in" | "out";
  date_from?: string;
  date_to?: string;
  store_id?: string;
  transaction_number?: string;
  page?: number;
  per_page?: number;
}

export interface MovementFilterSource {
  value: string;
  label: string;
  category: string;
}

export interface MovementFilterDirection {
  value: string;
  label: string;
}

export interface MovementFilterOption {
  value: string;
  label: string;
}

export interface MovementFilterOptions {
  sources: MovementFilterSource[];
  directions: MovementFilterDirection[];
  locations: MovementFilterOption[];
  stores: MovementFilterOption[];
}
