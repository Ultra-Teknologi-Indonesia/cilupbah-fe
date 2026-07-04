export type DeliveryMethod =
  | "COURIER"
  | "SELF_PICKUP"
  | "JUBELIO_SHIPMENT";

export interface ManualOrderItemPayload {
  item_id: string;
  sku: string;
  description?: string | null;
  qty_in_base: number;
  price: number;
  disc?: number;
  disc_percent?: number;
  tax_amount?: number;
}

export interface ManualOrderPayload {
  salesorder_no?: string | null;
  no_ref?: string | null;
  transaction_date: string;
  internal_store_id: string;
  salesman_id?: string | null;
  location_id: string;
  customer_id?: string | null;
  customer_name: string;
  note?: string | null;

  sub_total?: number;
  total_disc?: number;
  other_discount?: number;
  total_tax?: number;
  shipping_cost?: number;
  shipping_discount?: number;
  insurance_cost?: number;
  service_fee?: number;
  seller_voucher?: number;
  order_processing_fee?: number;
  grand_total?: number;
  price_includes_tax?: boolean;

  is_paid?: boolean;
  is_cod?: boolean;
  is_jubelio_shipment?: boolean;

  delivery_method: DeliveryMethod;
  shipping_provider?: string | null;
  tracking_number?: string | null;
  order_weight_gram?: number | null;

  shipping_full_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_province?: string | null;
  shipping_post_code?: string | null;
  shipping_country?: string | null;

  items: ManualOrderItemPayload[];
}
