import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircle2Icon,
  ClipboardListIcon,
  PackageIcon,
  ShoppingBagIcon,
  TruckIcon,
  UserIcon,
  type LucideIcon,
} from "lucide-react";

type Tone = "primary" | "success" | "warning" | "destructive";

export interface NotificationMeta {
  icon: LucideIcon;
  tone: Tone;
  label: string;
}

const REGISTRY: Record<string, NotificationMeta> = {
  task_assigned: { icon: ClipboardListIcon, tone: "primary", label: "Tugas" },
  order_new: {
    icon: ShoppingBagIcon,
    tone: "primary",
    label: "Pesanan Baru",
  },
  order_shipped: {
    icon: TruckIcon,
    tone: "primary",
    label: "Pesanan Dikirim",
  },
  order_completed: {
    icon: CheckCircle2Icon,
    tone: "success",
    label: "Pesanan Selesai",
  },
  stock_low: {
    icon: AlertTriangleIcon,
    tone: "warning",
    label: "Stok Menipis",
  },
  stock_replenishment: {
    icon: PackageIcon,
    tone: "warning",
    label: "Pengisian Stok",
  },
  user_action: { icon: UserIcon, tone: "primary", label: "Pengguna" },
};

const FALLBACK: NotificationMeta = {
  icon: BellIcon,
  tone: "primary",
  label: "Notifikasi",
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
