// Single source of truth for status labels + Badge variants across the dashboard.
//
// Every domain below consolidates a status map that previously lived inline in a
// component or type file. Labels (Indonesian) are preserved exactly; the original
// color/className is mapped to the closest Badge variant (see components/ui/badge.tsx).
//
// Render statuses through <StatusBadge domain="…" status={raw} /> so the label and
// color stay identical everywhere. Do NOT put non-status badges here (channel/source
// badges, pickup-status, payment badges) — those keep their own rendering.

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "success"
  | "warning"
  | "muted"
  | "info"
  | "indigo"
  | "purple"
  | "orange"
  | "teal"

export interface StatusMeta {
  label: string
  variant: BadgeVariant
}

export type Domain =
  | "sales-return"
  | "purchase-return"
  | "inventory-transfer"
  | "stock-adjustment"
  | "stock-opname"
  | "stock-revaluation"
  | "stock-reserve"
  | "return-settlement"
  | "picklist"
  | "packlist"
  | "shipment"
  | "purchase-order"
  | "sales-order"
  | "inbound"
  | "putaway"
  | "channel-integration"

export const STATUS_REGISTRY: Record<Domain, Record<string, StatusMeta>> = {
  // Retur penjualan (barang-masuk/sales-return*)
  "sales-return": {
    PENDING: { label: "Menunggu", variant: "warning" },
    ACCEPTED: { label: "Disetujui", variant: "info" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  // Retur pembelian (barang-keluar/retur-pembelian, purchase-return-detail)
  "purchase-return": {
    DRAFT: { label: "Draft", variant: "muted" },
    SUBMITTED: { label: "Diajukan", variant: "info" },
    APPROVED: { label: "Disetujui", variant: "indigo" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Transfer antar lokasi (transfer keluar/masuk/internal)
  "inventory-transfer": {
    DRAFT: { label: "Draft", variant: "muted" },
    APPROVED: { label: "Disetujui", variant: "indigo" },
    IN_TRANSIT: { label: "Dikirim", variant: "info" },
    RECEIVED: { label: "Diterima", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Penyesuaian stok (transaksi-stok/penyesuaian*)
  "stock-adjustment": {
    DRAFT: { label: "Draft", variant: "muted" },
    APPROVED: { label: "Disetujui", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Stock opname (transaksi-stok/opname*)
  "stock-opname": {
    DRAFT: { label: "Draft", variant: "muted" },
    IN_PROGRESS: { label: "Proses", variant: "info" },
    FINALIZED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Revaluasi stok (transaksi-stok/revaluasi*)
  "stock-revaluation": {
    APPROVED: { label: "Disetujui", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Stok cadang / reserved (transaksi-stok/cadang*)
  "stock-reserve": {
    ACTIVE: { label: "Aktif", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Settlement retur (barang-masuk/return-settlement)
  "return-settlement": {
    DRAFT: { label: "Draft", variant: "muted" },
    CONFIRMED: { label: "Dikonfirmasi", variant: "info" },
    COMPLETED: { label: "Selesai", variant: "success" },
  },

  // Picklist (proses-pesanan/picking)
  picklist: {
    DRAFT: { label: "Draft", variant: "muted" },
    IN_PROGRESS: { label: "Diproses", variant: "info" },
    COMPLETED: { label: "Selesai", variant: "success" },
    FAILED: { label: "Gagal", variant: "destructive" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  // Packlist (proses-pesanan/packing)
  packlist: {
    DRAFT: { label: "Draft", variant: "muted" },
    IN_PROGRESS: { label: "Diproses", variant: "info" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  // Pengiriman / shipment (proses-pesanan/shipping)
  shipment: {
    SCHEDULED: { label: "Terjadwal", variant: "info" },
    HANDED_OVER: { label: "Diserahkan", variant: "warning" },
    IN_TRANSIT: { label: "Dikirim", variant: "indigo" },
    DELIVERED: { label: "Terkirim", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  // Pesanan pembelian / PO (transaksi-pembelian + barang-masuk/pesanan-pembelian)
  "purchase-order": {
    DRAFT: { label: "Draft", variant: "muted" },
    OPEN: { label: "Belum Diterima", variant: "warning" },
    PARTIAL_RECEIVED: { label: "Diterima Sebagian", variant: "info" },
    CLOSED: { label: "Ditutup", variant: "muted" },
    FULLY_RECEIVED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Pesanan penjualan (pesanan/order-card, order-detail, fulfillment orders)
  "sales-order": {
    pending: { label: "Menunggu", variant: "orange" },
    reserved: { label: "Siap Proses", variant: "info" },
    picked: { label: "Dipick", variant: "teal" },
    packed: { label: "Dikemas - Siap Dikirim", variant: "purple" },
    shipped: { label: "Dikirim", variant: "success" },
    cancelled: { label: "Dibatalkan", variant: "destructive" },
  },

  // Penerimaan / inbound (barang-masuk/penerimaan*)
  inbound: {
    DRAFT: { label: "Belum Mulai", variant: "muted" },
    PARTIAL: { label: "Sebagian", variant: "warning" },
    RECEIVED: { label: "Selesai Diterima", variant: "info" },
    PUTAWAY_IN_PROGRESS: { label: "Sedang Putaway", variant: "indigo" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Penempatan / putaway (barang-masuk/penempatan)
  putaway: {
    NOT_STARTED: { label: "Belum Mulai", variant: "muted" },
    IN_PROGRESS: { label: "Sedang Diproses", variant: "warning" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  // Status integrasi toko (integrasi-channel/stores-table)
  "channel-integration": {
    normal: { label: "Normal", variant: "success" },
    warning: { label: "Perlu Perhatian", variant: "warning" },
    error: { label: "Integrasi Bermasalah", variant: "destructive" },
  },
}

const FALLBACK_VARIANT: BadgeVariant = "muted"

/**
 * Resolve a status string to its label + Badge variant for a domain.
 * Falls back to `{ label: status, variant: "muted" }` for unknown statuses.
 */
export function getStatusMeta(domain: Domain, status: string | null | undefined): StatusMeta {
  const raw = status ?? ""
  const meta = STATUS_REGISTRY[domain]?.[raw]
  if (meta) return meta
  return { label: raw || "—", variant: FALLBACK_VARIANT }
}
