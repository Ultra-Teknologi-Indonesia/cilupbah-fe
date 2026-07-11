export interface NegativeStockParams {
  from?: string;
  to?: string;
  location_id?: string;
  search?: string;
  still_negative?: boolean;
  page?: number;
  per_page?: number;
}

export interface NegativeStockRow {
  item_id: string;
  sku: string;
  product_name: string | null;
  location_id: string | null;
  location_name: string | null;
  bin_id: string | null;
  bin_code: string | null;
  first_negative_at: string | null;
  last_negative_at: string | null;
  min_balance: number;
  current_balance: number | null;
  normalized_at: string | null;
  triggered_by: string | null;
  negative_movements_count: number;
  still_negative: boolean;
}
