import type { BarcodeHarga, BarcodeLabel } from "@/types/laporan/barcode";

export interface PrintableLabel {
  key: string;
  sku: string;
  name: string;
  storeName?: string | null;
  price?: number | null;
}

export function buildPrintableLabels(
  labels: BarcodeLabel[],
  harga: BarcodeHarga,
): PrintableLabel[] {
  if (harga === "online") {
    return labels.flatMap((label) =>
      label.prices.map((price, i) => ({
        key: `${label.sku}__${i}__${price.store_name ?? "toko"}`,
        sku: label.sku,
        name: label.name,
        storeName: price.store_name,
        price: price.price,
      })),
    );
  }

  return labels.map((label) => ({
    key: label.sku,
    sku: label.sku,
    name: label.name,
    price: harga === "default" ? (label.prices[0]?.price ?? null) : null,
  }));
}
