export interface LaporanReturParams {
  date_from?: string;
  date_to?: string;
  location_id?: string;
  channel_shop_id?: string;
  status?: string;
  source?: "manual" | "marketplace" | "";
  reason_category?: string;
  marketplace_decision?: string;
  page?: number;
  per_page?: number;
}

export interface LaporanReturRow {
  id: string;
  return_number: string;
  order_id: string | null;
  order_no: string | null;
  channel_order_no: string | null;
  channel_shop_id: string | null;
  channel_return_id: string | null;
  location_id: string;
  location_name: string | null;
  customer_name: string | null;
  source: "manual" | "marketplace";
  status: string;
  reason: string | null;
  reason_category: string | null;
  notes: string | null;
  processed_by: string | null;
  processed_at: string | null;
  created_at: string | null;
  marketplace_decision: string | null;
  channel_reason_text: string | null;
  refund_amount: number | null;
  shipping_fee_original: number | null;
  shipping_fee_return: number | null;
  return_tracking_number: string | null;
  return_carrier: string | null;
  return_shipped_at: string | null;
  settlement_number: string | null;
  settlement_status: string | null;
  settlement_total: number;
  refund_total: number;
  refund_count: number;
  refund_methods: string[];
  refund_last_date: string | null;
}
