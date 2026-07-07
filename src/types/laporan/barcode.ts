export type BarcodeJenis = "sku" | "sku_induk";
export type BarcodeHarga = "tanpa_harga" | "default" | "online";

export interface BarcodeLabelPrice {
  store_name: string | null;
  channel_code: string | null;
  price: number | null;
}

export interface BarcodeLabel {
  sku: string;
  name: string;
  prices: BarcodeLabelPrice[];
}

export interface BarcodeReportMeta {
  jenis: BarcodeJenis;
  harga: BarcodeHarga;
  total_variants: number;
  total_labels: number;
}

export interface BarcodeReportPayload {
  report_type: "barcode";
  generated_at: string;
  meta: BarcodeReportMeta;
  labels: BarcodeLabel[];
}

export interface BarcodeReportParams {
  jenis: BarcodeJenis;
  ids: string[];
  harga: BarcodeHarga;
}
