import {
  AlertTriangleIcon,
  ArrowDownToLineIcon,
  ArrowUpFromLineIcon,
  BellIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  DownloadIcon,
  FileWarningIcon,
  KeyRoundIcon,
  LinkIcon,
  PackageIcon,
  PackageXIcon,
  ReplyIcon,
  RotateCcwIcon,
  ScrollTextIcon,
  ServerCrashIcon,
  ShieldAlertIcon,
  ShoppingBagIcon,
  TrendingDownIcon,
  TruckIcon,
  UndoIcon,
  UploadIcon,
  UserIcon,
  UsersIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";

import type { AppNotification } from "@/types/notification";

export type NotificationDomain =
  "pesanan" | "gudang" | "stok" | "retur" | "integrasi" | "sistem";

export type NotificationSeverity = "info" | "warning" | "critical";

type Tone = "primary" | "success" | "warning" | "destructive";

export interface NotificationMeta {
  icon: LucideIcon;
  tone: Tone;
  label: string;
  domain: NotificationDomain;
  severity: NotificationSeverity;
}

const REGISTRY: Record<string, NotificationMeta> = {
  order_new: {
    icon: ShoppingBagIcon,
    tone: "primary",
    label: "Pesanan Baru",
    domain: "pesanan",
    severity: "info",
  },
  order_empty_stock: {
    icon: PackageXIcon,
    tone: "warning",
    label: "Stok Kosong",
    domain: "pesanan",
    severity: "warning",
  },
  order_cancelled: {
    icon: XCircleIcon,
    tone: "warning",
    label: "Pesanan Dibatalkan",
    domain: "pesanan",
    severity: "warning",
  },
  order_sla_warning: {
    icon: AlertTriangleIcon,
    tone: "destructive",
    label: "SLA Menipis",
    domain: "pesanan",
    severity: "critical",
  },
  order_shipped: {
    icon: TruckIcon,
    tone: "primary",
    label: "Pesanan Dikirim",
    domain: "pesanan",
    severity: "info",
  },
  order_delivered: {
    icon: CheckCircle2Icon,
    tone: "success",
    label: "Pesanan Sampai",
    domain: "pesanan",
    severity: "info",
  },

  task_assigned: {
    icon: ClipboardListIcon,
    tone: "primary",
    label: "Tugas Baru",
    domain: "gudang",
    severity: "info",
  },
  putaway_completed: {
    icon: CheckCircle2Icon,
    tone: "success",
    label: "Penempatan Selesai",
    domain: "gudang",
    severity: "info",
  },
  picklist_assigned: {
    icon: ClipboardListIcon,
    tone: "primary",
    label: "Picklist",
    domain: "gudang",
    severity: "info",
  },
  packlist_assigned: {
    icon: PackageIcon,
    tone: "primary",
    label: "Packlist",
    domain: "gudang",
    severity: "info",
  },
  shipment_ready_manual: {
    icon: TruckIcon,
    tone: "primary",
    label: "Kurir Instan Manual",
    domain: "gudang",
    severity: "info",
  },
  shipment_delivered: {
    icon: CheckCircle2Icon,
    tone: "success",
    label: "Terkirim",
    domain: "gudang",
    severity: "info",
  },
  transfer_transit_received: {
    icon: ArrowDownToLineIcon,
    tone: "primary",
    label: "Transfer Masuk",
    domain: "gudang",
    severity: "info",
  },
  inbound_received: {
    icon: ArrowDownToLineIcon,
    tone: "primary",
    label: "Penerimaan Baru",
    domain: "gudang",
    severity: "info",
  },

  stock_low: {
    icon: TrendingDownIcon,
    tone: "warning",
    label: "Stok Menipis",
    domain: "stok",
    severity: "warning",
  },
  stock_negative_recorded: {
    icon: AlertTriangleIcon,
    tone: "destructive",
    label: "Stok Minus",
    domain: "stok",
    severity: "critical",
  },
  stock_opname_variance: {
    icon: FileWarningIcon,
    tone: "warning",
    label: "Selisih Opname",
    domain: "stok",
    severity: "warning",
  },
  stock_replenishment_request: {
    icon: PackageIcon,
    tone: "primary",
    label: "Permintaan Restock",
    domain: "stok",
    severity: "info",
  },
  stock_replenishment_accepted: {
    icon: CheckCircle2Icon,
    tone: "success",
    label: "Restock Disetujui",
    domain: "stok",
    severity: "info",
  },
  stock_replenishment_rejected: {
    icon: XCircleIcon,
    tone: "warning",
    label: "Restock Ditolak",
    domain: "stok",
    severity: "warning",
  },
  stock_replenishment_auto_detected: {
    icon: AlertTriangleIcon,
    tone: "warning",
    label: "Deteksi Kekurangan Otomatis",
    domain: "stok",
    severity: "warning",
  },

  sales_return_new: {
    icon: UndoIcon,
    tone: "warning",
    label: "Retur Baru",
    domain: "retur",
    severity: "warning",
  },
  sales_return_marketplace_decision: {
    icon: ScrollTextIcon,
    tone: "warning",
    label: "Keputusan Marketplace",
    domain: "retur",
    severity: "warning",
  },
  sales_return_reversed: {
    icon: RotateCcwIcon,
    tone: "destructive",
    label: "Retur Dibalikkan",
    domain: "retur",
    severity: "critical",
  },
  purchase_return_submitted: {
    icon: ReplyIcon,
    tone: "primary",
    label: "Retur Pembelian",
    domain: "retur",
    severity: "info",
  },

  channel_token_expiring: {
    icon: KeyRoundIcon,
    tone: "warning",
    label: "Token Marketplace Kadaluarsa",
    domain: "integrasi",
    severity: "warning",
  },
  channel_disconnected: {
    icon: LinkIcon,
    tone: "destructive",
    label: "Koneksi Marketplace Putus",
    domain: "integrasi",
    severity: "critical",
  },
  channel_product_download_failed: {
    icon: DownloadIcon,
    tone: "warning",
    label: "Gagal Download Produk",
    domain: "integrasi",
    severity: "warning",
  },
  channel_product_upload_failed: {
    icon: UploadIcon,
    tone: "warning",
    label: "Gagal Naikkan Produk",
    domain: "integrasi",
    severity: "warning",
  },

  impex_import_completed: {
    icon: CheckCircle2Icon,
    tone: "success",
    label: "Import Selesai",
    domain: "sistem",
    severity: "info",
  },
  impex_import_failed: {
    icon: XCircleIcon,
    tone: "destructive",
    label: "Import Gagal",
    domain: "sistem",
    severity: "warning",
  },
  impex_export_ready: {
    icon: ArrowUpFromLineIcon,
    tone: "primary",
    label: "Export Siap",
    domain: "sistem",
    severity: "info",
  },
  user_role_granted: {
    icon: ShieldAlertIcon,
    tone: "primary",
    label: "Peran Diberikan",
    domain: "sistem",
    severity: "info",
  },
  user_created: {
    icon: UsersIcon,
    tone: "primary",
    label: "Pengguna Baru",
    domain: "sistem",
    severity: "info",
  },
  queue_job_failed_repeatedly: {
    icon: ServerCrashIcon,
    tone: "destructive",
    label: "Job Antrian Gagal",
    domain: "sistem",
    severity: "critical",
  },
  user_action: {
    icon: UserIcon,
    tone: "primary",
    label: "Pengguna",
    domain: "sistem",
    severity: "info",
  },
  general: {
    icon: BellIcon,
    tone: "primary",
    label: "Notifikasi",
    domain: "sistem",
    severity: "info",
  },
};

const FALLBACK: NotificationMeta = {
  icon: BellIcon,
  tone: "primary",
  label: "Notifikasi",
  domain: "sistem",
  severity: "info",
};

export function getNotificationMeta(type?: string | null): NotificationMeta {
  if (!type) return FALLBACK;
  return REGISTRY[type] ?? FALLBACK;
}

const TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function notificationToneClass(tone: Tone): string {
  return TONE_CLASS[tone];
}

const SEVERITY_BORDER: Record<NotificationSeverity, string> = {
  info: "",
  warning: "border-l-2 border-l-warning",
  critical: "border-l-2 border-l-destructive",
};

export function severityBorderClass(severity: NotificationSeverity): string {
  return SEVERITY_BORDER[severity];
}

export const DOMAIN_LABEL: Record<NotificationDomain, string> = {
  pesanan: "Pesanan",
  gudang: "Gudang",
  stok: "Stok",
  retur: "Retur",
  integrasi: "Integrasi",
  sistem: "Sistem",
};

const DOMAIN_ORDER: NotificationDomain[] = [
  "pesanan",
  "gudang",
  "stok",
  "retur",
  "integrasi",
  "sistem",
];

export function listDomains(): NotificationDomain[] {
  return DOMAIN_ORDER;
}

const SEVERITY_RANK: Record<NotificationSeverity, number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

export function sortByPriority(items: AppNotification[]): AppNotification[] {
  return [...items].sort((a, b) => {
    const metaA = getNotificationMeta(a.type);
    const metaB = getNotificationMeta(b.type);
    const rank = SEVERITY_RANK[metaA.severity] - SEVERITY_RANK[metaB.severity];
    if (rank !== 0) return rank;
    const unread = Number(a.is_read) - Number(b.is_read);
    if (unread !== 0) return unread;
    return b.created_at.localeCompare(a.created_at);
  });
}
