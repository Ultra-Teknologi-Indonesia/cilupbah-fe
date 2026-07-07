export type BarcodeJenis = "sku" | "sku_induk";
export type BarcodeHarga = "tanpa_harga" | "default" | "online";

export interface BarcodeReportParams {
  jenis: BarcodeJenis;
  ids: string[];
  harga: BarcodeHarga;
  download?: boolean;
}
