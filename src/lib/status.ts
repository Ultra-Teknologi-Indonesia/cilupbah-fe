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
  | "teal";

export interface StatusMeta {
  label: string;
  variant: BadgeVariant;
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
  | "channel-integration";

export const STATUS_REGISTRY: Record<Domain, Record<string, StatusMeta>> = {
  "sales-return": {
    PENDING: { label: "Menunggu", variant: "warning" },
    ACCEPTED: { label: "Disetujui", variant: "info" },
    REJECTED: { label: "Ditolak", variant: "destructive" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  "purchase-return": {
    DRAFT: { label: "Draft", variant: "muted" },
    SUBMITTED: { label: "Diajukan", variant: "info" },
    APPROVED: { label: "Disetujui", variant: "indigo" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "inventory-transfer": {
    DRAFT: { label: "Draft", variant: "muted" },
    APPROVED: { label: "Disetujui", variant: "indigo" },
    IN_TRANSIT: { label: "Dikirim", variant: "info" },
    RECEIVED: { label: "Diterima", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "stock-adjustment": {
    DRAFT: { label: "Draft", variant: "muted" },
    APPROVED: { label: "Disetujui", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "stock-opname": {
    DRAFT: { label: "Draft", variant: "muted" },
    IN_PROGRESS: { label: "Proses", variant: "info" },
    FINALIZED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "stock-revaluation": {
    APPROVED: { label: "Disetujui", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "stock-reserve": {
    ACTIVE: { label: "Aktif", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "return-settlement": {
    DRAFT: { label: "Draft", variant: "muted" },
    CONFIRMED: { label: "Dikonfirmasi", variant: "info" },
    COMPLETED: { label: "Selesai", variant: "success" },
  },

  picklist: {
    DRAFT: { label: "Draft", variant: "muted" },
    IN_PROGRESS: { label: "Diproses", variant: "info" },
    COMPLETED: { label: "Selesai", variant: "success" },
    FAILED: { label: "Gagal", variant: "destructive" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  packlist: {
    DRAFT: { label: "Draft", variant: "muted" },
    IN_PROGRESS: { label: "Diproses", variant: "info" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  shipment: {
    SCHEDULED: { label: "Terjadwal", variant: "info" },
    HANDED_OVER: { label: "Diserahkan", variant: "warning" },
    IN_TRANSIT: { label: "Dikirim", variant: "indigo" },
    DELIVERED: { label: "Terkirim", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "muted" },
  },

  "purchase-order": {
    DRAFT: { label: "Draft", variant: "muted" },
    OPEN: { label: "Belum Diterima", variant: "warning" },
    PARTIAL_RECEIVED: { label: "Diterima Sebagian", variant: "info" },
    CLOSED: { label: "Ditutup", variant: "muted" },
    FULLY_RECEIVED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "sales-order": {
    pending: { label: "Menunggu", variant: "orange" },
    reserved: { label: "Siap Proses", variant: "info" },
    picked: { label: "Dipick", variant: "teal" },
    packed: { label: "Dikemas - Siap Dikirim", variant: "purple" },
    shipped: { label: "Dikirim", variant: "success" },
    cancelled: { label: "Dibatalkan", variant: "destructive" },
  },

  inbound: {
    DRAFT: { label: "Belum Mulai", variant: "muted" },
    PARTIAL: { label: "Sebagian", variant: "warning" },
    RECEIVED: { label: "Selesai Diterima", variant: "info" },
    PUTAWAY_IN_PROGRESS: { label: "Sedang Putaway", variant: "indigo" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  putaway: {
    NOT_STARTED: { label: "Belum Mulai", variant: "muted" },
    IN_PROGRESS: { label: "Sedang Diproses", variant: "warning" },
    COMPLETED: { label: "Selesai", variant: "success" },
    CANCELLED: { label: "Dibatalkan", variant: "destructive" },
  },

  "channel-integration": {
    normal: { label: "Normal", variant: "success" },
    warning: { label: "Perlu Perhatian", variant: "warning" },
    error: { label: "Integrasi Bermasalah", variant: "destructive" },
  },
};

const FALLBACK_VARIANT: BadgeVariant = "muted";

export function getStatusMeta(
  domain: Domain,
  status: string | null | undefined,
): StatusMeta {
  const raw = status ?? "";
  const meta = STATUS_REGISTRY[domain]?.[raw];
  if (meta) return meta;
  return { label: raw || "—", variant: FALLBACK_VARIANT };
}
