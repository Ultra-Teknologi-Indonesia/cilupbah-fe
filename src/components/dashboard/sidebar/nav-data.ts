import {
  Home,
  Package2,
  Tag,
  FolderTree,
  BarChart2,
  RefreshCw,
  Eye,
  PackageCheck,
  ShoppingBag,
  Store,
  CornerDownLeft,
  Users,
  MonitorSmartphone,
  LinkIcon,
  ClipboardList,
  CornerUpLeft,
  Truck,
  Inbox,
  Send,
  Archive,
  ReceiptText,
  HandCoins,
  Landmark,
  BookOpen,
  Building2,
  Map,
  TrendingUp,
  TrendingDown,
  PackageOpen,
  Factory,
  CircleDollarSign,
  Settings,
  HelpCircle,
  Layers,
  Warehouse,
  BarChart3,
  Undo2,
} from "lucide-react";
import type React from "react";
import type { Route } from "./nav-main";

export type NavZone = "top" | "ops" | "fin";

export type NavGroup = {
  id: string;
  title: string;
  icon: React.ElementType;
  zone: NavZone;
  items: Route[];
};

export const dashboardGroups: NavGroup[] = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: Home,
    zone: "top",
    items: [
      { id: "dashboard", title: "Dashboard", icon: Home, link: "/dashboard" },
    ],
  },
  {
    id: "katalog",
    title: "Katalog",
    icon: Tag,
    zone: "ops",
    items: [
      {
        id: "produk",
        title: "Produk",
        icon: Package2,
        link: "/dashboard/produk",
      },

      {
        id: "kategori-merek",
        title: "Kategori",
        icon: FolderTree,
        link: "/dashboard/kategori-merek/kategori",
      },
    ],
  },
  {
    id: "persediaan",
    title: "Persediaan",
    icon: Layers,
    zone: "ops",
    items: [
      {
        id: "posisi-stok",
        title: "Posisi Stok",
        icon: BarChart2,
        link: "/dashboard/posisi-stok",
      },
      {
        id: "transaksi-stok",
        title: "Transaksi Stok",
        icon: RefreshCw,
        link: "/dashboard/transaksi-stok",
      },
      {
        id: "monitor-stok",
        title: "Monitor Stok",
        icon: Eye,
        link: "/dashboard/monitor-stok",
      },
    ],
  },
  {
    id: "penjualan",
    title: "Penjualan",
    icon: ShoppingBag,
    zone: "ops",
    items: [
      {
        id: "pesanan",
        title: "Pesanan",
        icon: ShoppingBag,
        link: "/dashboard/pesanan",
      },
      {
        id: "toko-internal",
        title: "Toko Internal",
        icon: Store,
        link: "/dashboard/toko-internal",
      },
      {
        id: "retur-penjualan",
        title: "Retur Penjualan",
        icon: CornerDownLeft,
        link: "/dashboard/retur-penjualan",
        comingSoon: true,
      },
      {
        id: "kontak-pelanggan",
        title: "Kontak Pelanggan",
        icon: Users,
        link: "/dashboard/kontak-pelanggan",
      },

      {
        id: "integrasi-channel",
        title: "Integrasi Channel",
        icon: LinkIcon,
        link: "/dashboard/integrasi-channel",
      },
    ],
  },
  {
    id: "pembelian",
    title: "Pembelian",
    icon: ClipboardList,
    zone: "ops",
    items: [
      {
        id: "transaksi-pembelian",
        title: "Transaksi Pembelian",
        icon: ClipboardList,
        link: "/dashboard/transaksi-pembelian",
        match: ["/dashboard/transaksi-pembelian"],
      },
      {
        id: "kontak-pemasok",
        title: "Kontak Pemasok",
        icon: Truck,
        link: "/dashboard/kontak-pemasok",
      },
    ],
  },
  {
    id: "gudang",
    title: "Gudang",
    icon: Warehouse,
    zone: "ops",
    items: [
      {
        id: "barang-masuk",
        title: "Barang Masuk (Inbound)",
        icon: Inbox,
        link: "/dashboard/barang-masuk",
      },
      {
        id: "barang-keluar",
        title: "Barang Keluar (Outbound)",
        icon: Send,
        link: "/dashboard/barang-keluar",
      },
      {
        id: "proses-pesanan",
        title: "Proses Pesanan",
        icon: PackageCheck,
        link: "/dashboard/proses-pesanan",
      },
      {
        id: "manajemen-rak",
        title: "Manajemen Rak & Lokasi",
        icon: Archive,
        link: "/dashboard/lokasi",
      },
      {
        id: "permintaan-restock",
        title: "Permintaan Pengisian Stok",
        icon: HandCoins,
        link: "/dashboard/permintaan-restock",
      },
    ],
  },

  {
    id: "laporan",
    title: "Laporan",
    icon: BarChart3,
    zone: "fin",
    items: [
      {
        id: "laporan-hpp",
        title: "Laporan HPP",
        icon: CircleDollarSign,
        link: "/dashboard/laporan/hpp",
      },
      {
        id: "laporan-retur",
        title: "Laporan Retur",
        icon: Undo2,
        link: "/dashboard/laporan/retur",
      },
      {
        id: "laporan-penjualan",
        title: "Laporan Penjualan",
        icon: TrendingUp,
        link: "/dashboard/laporan/penjualan",
        comingSoon: true,
      },
      {
        id: "laporan-pembelian",
        title: "Laporan Pembelian",
        icon: TrendingDown,
        link: "/dashboard/laporan/pembelian",
        comingSoon: true,
      },
      {
        id: "laporan-persediaan",
        title: "Laporan Persediaan",
        icon: PackageOpen,
        link: "/dashboard/laporan/persediaan",
      },
      {
        id: "laporan-gudang",
        title: "Laporan Gudang",
        icon: Factory,
        link: "/dashboard/laporan/gudang",
        comingSoon: true,
      },
    ],
  },
];

export const settingsRoutes: Route[] = [
  {
    id: "pengaturan",
    title: "Pengaturan",
    icon: Settings,
    link: "/dashboard/pengaturan",
    subs: [
      { title: "Daftar Pengguna", link: "/dashboard/pengaturan/pengguna" },
      { title: "Peran & Hak Akses", link: "/dashboard/pengaturan/peran" },
      {
        title: "Aktivitas Import dan Export",
        link: "/dashboard/aktivitas-impex",
      },
    ],
  },
  {
    id: "bantuan",
    title: "Bantuan",
    icon: HelpCircle,
    link: "/dashboard/bantuan",
  },
];

/**
 * Peta izin untuk gating menu (per id item nav & per link sub-pengaturan).
 * Item tanpa entri (Dashboard, Bantuan, Umum) selalu tampil.
 */
export const NAV_PERMISSION: Record<string, string | string[]> = {
  produk: "view-produk",
  "kategori-merek": "view-kategori",
  "posisi-stok": "view-posisi-stok",
  "transaksi-stok": [
    "view-penyesuaian-stok",
    "view-pindah-bin",
    "view-stok-opname",
    "view-revaluasi-stok",
  ],
  "monitor-stok": "view-monitor-stok",
  pesanan: "view-pesanan",
  "toko-internal": "view-toko-internal",
  "retur-penjualan": "view-retur-penjualan",
  "kontak-pelanggan": "view-kontak-pelanggan",
  "integrasi-channel": "view-integrasi-channel",
  "transaksi-pembelian": "view-transaksi-pembelian",
  "kontak-pemasok": "view-kontak-pemasok",
  "barang-masuk": ["view-barang-masuk", "view-penempatan"],
  "barang-keluar": "view-barang-keluar",
  "proses-pesanan": ["view-picking", "view-packing", "view-pengiriman"],
  "manajemen-rak": "view-manajemen-rak",
  "permintaan-restock": "view-permintaan-restock",
  "laporan-hpp": "view-laporan-hpp",
  "laporan-retur": "view-laporan-retur",
  "laporan-penjualan": "view-laporan-penjualan",
  "laporan-pembelian": "view-laporan-pembelian",
  "laporan-persediaan": "view-laporan-persediaan",
  "laporan-gudang": "view-laporan-gudang",
};

const SETTINGS_SUB_PERMISSION: Record<string, string | string[]> = {
  "/dashboard/pengaturan/pengguna": "view-user",
  "/dashboard/pengaturan/peran": ["view-role", "view-permission"],
  "/dashboard/aktivitas-impex": "view-impex",
};

type PermCheck = (perm?: string | string[]) => boolean;

/** Filter grup nav berdasar izin; buang item & grup yang tak diizinkan. */
export function filterNavGroups(
  groups: NavGroup[],
  has: PermCheck,
): NavGroup[] {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => has(NAV_PERMISSION[item.id])),
    }))
    .filter((group) => group.items.length > 0);
}

/** Filter sub-menu Pengaturan; gear tetap tampil (mis. halaman Umum). */
export function filterSettingsRoutes(
  routes: Route[],
  has: PermCheck,
): Route[] {
  return routes.map((route) =>
    route.subs
      ? {
          ...route,
          subs: route.subs.filter((sub) =>
            has(SETTINGS_SUB_PERMISSION[sub.link]),
          ),
        }
      : route,
  );
}

export const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
];

function linkMatchLen(pathname: string, link: string): number {
  return pathname === link || pathname.startsWith(link + "/")
    ? link.length
    : -1;
}

function routeMatchLen(pathname: string, route: Route): number {
  let best = linkMatchLen(pathname, route.link);
  route.match?.forEach((m) => {
    best = Math.max(best, linkMatchLen(pathname, m));
  });
  route.subs?.forEach((s) => {
    best = Math.max(best, linkMatchLen(pathname, s.link));
    s.subs?.forEach((n) => {
      best = Math.max(best, linkMatchLen(pathname, n.link));
    });
  });
  return best;
}

export function findGroupIdForPath(
  pathname: string,
  groups: NavGroup[],
): string {
  let bestId = groups[0].id;
  let bestLen = -1;
  for (const group of groups) {
    for (const item of group.items) {
      const len = routeMatchLen(pathname, item);
      if (len > bestLen) {
        bestLen = len;
        bestId = group.id;
      }
    }
  }
  return bestId;
}

export function isLeafGroup(group: NavGroup): boolean {
  return group.items.length === 1 && !group.items[0].subs?.length;
}
