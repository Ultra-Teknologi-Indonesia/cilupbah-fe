export type BarcodeJenis = "sku" | "sku_induk";
export type BarcodeHarga = "tanpa_harga" | "default" | "online";
export type BarcodePaper =
  | "thermal_50x40"
  | "thermal_80x40"
  | "a4_single"
  | "a4_multi";

export const BARCODE_PAPER_DEFAULT: BarcodePaper = "thermal_50x40";

export const BARCODE_PAPER_OPTIONS: { value: BarcodePaper; label: string }[] = [
  { value: "thermal_50x40", label: "Thermal 50x40mm (SHELVING)" },
  { value: "thermal_80x40", label: "Thermal 80x40mm" },
  { value: "a4_single", label: "A4 (1 label per halaman)" },
  { value: "a4_multi", label: "A4 (8 label per halaman)" },
];

export interface BarcodeReportParams {
  jenis: BarcodeJenis;
  ids: string[];
  harga: BarcodeHarga;
  paper: BarcodePaper;
  download?: boolean;
}
