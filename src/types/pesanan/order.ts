export type OrderTab =
  | "all"
  | "unpaid"
  | "failed"
  | "ready-to-process"
  | "empty-stock"
  | "failed-pick"
  | "request-cancel"
  | "cancelled"
  | "returned"

export type OrderStatus =
  | "pending"
  | "reserved"
  | "picked"
  | "packed"
  | "shipped"
  | "cancelled"

export interface OrderListParams {
  tab?: OrderTab
  q?: string
  search_by?: "order" | "sku"
  channel?: string
  store_id?: string
  location_id?: string
  content_type?: "combo" | "single_1qty" | "single_nqty"
  date_from?: string
  date_to?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_dir?: "asc" | "desc"
}

export interface Order {
  id: string
  salesorder_no: string
  source: string | null
  channel_shop_id: string | null
  customer_name: string
  transaction_date: string | null
  status: OrderStatus
  channel_status: string | null
  is_paid: boolean
  is_canceled: boolean
  cancel_reason: string | null
  cancel_requested_at: string | null
  cancel_request_reason: string | null
  payment_method: string | null
  payment_method_name: string | null
  paid_time: string | null
  sub_total: number
  total_disc: number
  total_tax: number
  shipping_cost: number
  insurance_cost: number
  grand_total: number
  shipping: OrderShipping
  buyer_message: string | null
  seller_note: string | null
  location_id: string | null
  location_name: string | null
  total_qty: number
  total_sku: number
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export interface OrderShipping {
  full_name: string | null
  phone: string | null
  address: string | null
  city: string | null
  province: string | null
  post_code: string | null
  country: string | null
  provider: string | null
  tracking_number: string | null
}

export interface OrderItem {
  id: string
  item_id: string | null
  channel_product_id: string | null
  sku: string
  description: string | null
  qty_in_base: number
  price: number
  disc: number
  disc_amount: number
  tax_amount: number
  amount: number
}

export interface OrderTabCounts {
  all: number
  unpaid: number
  failed: number
  "ready-to-process": number
  "empty-stock": number
  "failed-pick": number
  "request-cancel": number
  cancelled: number
  returned: number
}

export const TAB_CONFIG = [
  { key: "all", label: "Semua" },
  { key: "unpaid", label: "Belum Dibayar" },
  { key: "failed", label: "Gagal Download" },
  { key: "ready-to-process", label: "Siap Proses" },
  { key: "empty-stock", label: "Stok Kosong" },
  { key: "failed-pick", label: "Gagal Picking" },
  { key: "request-cancel", label: "Request Batal" },
  { key: "cancelled", label: "Batal" },
  { key: "returned", label: "Diretur" },
] as const

export const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "text-amber-700 bg-amber-500/10 dark:text-amber-400" },
  reserved: { label: "Direservasi", className: "text-blue-700 bg-blue-500/10 dark:text-blue-400" },
  picked: { label: "Dipick", className: "text-indigo-700 bg-indigo-500/10 dark:text-indigo-400" },
  packed: { label: "Dipacking", className: "text-purple-700 bg-purple-500/10 dark:text-purple-400" },
  shipped: { label: "Dikirim", className: "text-emerald-700 bg-emerald-500/10 dark:text-emerald-400" },
  cancelled: { label: "Dibatalkan", className: "text-destructive bg-destructive/10" },
}

export const CHANNEL_MAP: Record<string, { label: string; color: string }> = {
  tiktok: { label: "TikTok", color: "#000000" },
  shopee: { label: "Shopee", color: "#EE4D2D" },
  tokopedia: { label: "Tokopedia", color: "#42B549" },
  lazada: { label: "Lazada", color: "#0F146D" },
}
