import type { OrderFinance } from "@/types/pesanan/order";

export interface SettlementParams {
  search?: string;
  channel?: string;
  channel_shop_id?: string;
  is_settled?: "true" | "false" | "";
  date_from?: string;
  date_to?: string;
  settled_from?: string;
  settled_to?: string;
  page?: number;
  per_page?: number;
}

export interface SettlementRow {
  id: string;
  salesorder_no: string;
  channel_order_no: string | null;
  source: string | null;
  channel_shop_id: string | null;
  shop_name: string | null;
  customer_name: string | null;
  transaction_date: string | null;
  channel_status: string | null;
  grand_total: number | null;
  finance: OrderFinance;
}

export interface SettlementSummary {
  total_gross: number;
  total_fee: number;
  total_settlement: number;
  unsettled_count: number;
}

export interface SettlementListMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  summary?: SettlementSummary | null;
}

export interface SettlementListResult {
  items: SettlementRow[];
  meta: SettlementListMeta;
  summary: SettlementSummary | null;
}
