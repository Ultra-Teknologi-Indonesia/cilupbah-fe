import { formatCurrency } from "@/lib/format";
import type { PurchaseActivityAction } from "@/types/transaksi-pembelian/activity";

const FIELD_LABELS: Record<string, string> = {
  contact_id: "Pemasok",
  location_id: "Lokasi",
  order_date: "Tanggal",
  expected_date: "Tanggal Diharapkan",
  ref_no: "No. Referensi",
  payment_term: "Termin",
  notes: "Keterangan",
  po_number: "No. Pesanan",
  status: "Status",
  qty: "Kuantitas",
  received_qty: "Jumlah Diterima",
  unit_price: "Harga Satuan",
  disc: "Diskon %",
  disc_amount: "Nilai Diskon",
  shipping_cost: "Ongkos Kirim",
  description: "Deskripsi",
  unit: "Satuan",
  total_amount: "Total",
  item_count: "Jumlah Produk",
  total_qty: "Total Kuantitas",
};

const CURRENCY_FIELDS = new Set([
  "unit_price",
  "disc_amount",
  "shipping_cost",
  "total_amount",
]);

const ACTION_LABELS: Record<PurchaseActivityAction, string> = {
  CREATED: "Pesanan dibuat",
  FIELD_CHANGED: "Data pesanan diubah",
  ITEM_ADDED: "Produk ditambahkan",
  ITEM_CHANGED: "Produk diubah",
  ITEM_REMOVED: "Produk dihapus",
  RECEIPT_REVERSED: "Penerimaan ditarik balik",
  RECEIVED: "Barang diterima",
  STATUS_CHANGED: "Status berubah",
  CANCELLED: "Pesanan dibatalkan",
};

export function labelForAction(action: PurchaseActivityAction): string {
  return ACTION_LABELS[action] ?? action;
}

export function labelForField(field: string): string {
  return FIELD_LABELS[field] ?? field;
}

export function formatRiwayatValue(field: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (CURRENCY_FIELDS.has(field)) return formatCurrency(Number(value));
  if (typeof value === "boolean") return value ? "Ya" : "Tidak";
  return String(value);
}
