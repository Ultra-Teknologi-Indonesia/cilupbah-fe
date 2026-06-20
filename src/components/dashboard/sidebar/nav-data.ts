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
  Boxes,
  Layers,
  Warehouse,
  BarChart3,
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
    items: [{ id: "dashboard", title: "Dashboard", icon: Home, link: "/dashboard" }],
  },
  {
    id: "katalog",
    title: "Katalog",
    icon: Boxes,
    zone: "ops",
    items: [
      {
        id: "produk",
        title: "Produk",
        icon: Package2,
        link: "/dashboard/master-produk",
        match: ["/dashboard/master-produk", "/dashboard/produk", "/dashboard/listing-marketplace"],
      },
      {
        id: "harga-promosi",
        title: "Harga & Promosi",
        icon: Tag,
        link: "/dashboard/harga-promosi",
        comingSoon: true,
      },
      {
        id: "kategori-merek",
        title: "Kategori & Merek",
        icon: FolderTree,
        link: "/dashboard/kategori-merek",
        subs: [
          { title: "Kategori", link: "/dashboard/kategori-merek/kategori" },
          { title: "Merek", link: "/dashboard/kategori-merek/merek" },
        ],
      },
    ],
  },
  {
    id: "persediaan",
    title: "Persediaan",
    icon: Layers,
    zone: "ops",
    items: [
      { id: "posisi-stok", title: "Posisi Stok", icon: BarChart2, link: "/dashboard/posisi-stok", comingSoon: true },
      { id: "transaksi-stok", title: "Transaksi Stok", icon: RefreshCw, link: "/dashboard/transaksi-stok", comingSoon: true },
      { id: "monitor-stok", title: "Monitor Stok", icon: Eye, link: "/dashboard/monitor-stok", comingSoon: true },
      { id: "stok-terpesan", title: "Stok Terpesan", icon: PackageCheck, link: "/dashboard/stok-terpesan", comingSoon: true },
    ],
  },
  {
    id: "penjualan",
    title: "Penjualan",
    icon: ShoppingBag,
    zone: "ops",
    items: [
      { id: "pesanan", title: "Pesanan", icon: ShoppingBag, link: "/dashboard/pesanan", comingSoon: true },
      { id: "retur-penjualan", title: "Retur Penjualan", icon: CornerDownLeft, link: "/dashboard/retur-penjualan", comingSoon: true },
      { id: "kontak-pelanggan", title: "Kontak Pelanggan", icon: Users, link: "/dashboard/kontak-pelanggan", comingSoon: true },
      { id: "kasir-pos", title: "Kasir (POS)", icon: MonitorSmartphone, link: "/dashboard/kasir-pos", comingSoon: true },
      { id: "integrasi-channel", title: "Integrasi Channel", icon: LinkIcon, link: "/dashboard/integrasi-channel" },
    ],
  },
  {
    id: "pembelian",
    title: "Pembelian",
    icon: ClipboardList,
    zone: "ops",
    items: [
      { id: "purchase-order", title: "Purchase Order", icon: ClipboardList, link: "/dashboard/purchase-order", comingSoon: true },
      { id: "retur-pembelian", title: "Retur Pembelian", icon: CornerUpLeft, link: "/dashboard/retur-pembelian", comingSoon: true },
      { id: "kontak-pemasok", title: "Kontak Pemasok", icon: Truck, link: "/dashboard/kontak-pemasok", comingSoon: true },
    ],
  },
  {
    id: "gudang",
    title: "Gudang",
    icon: Warehouse,
    zone: "ops",
    items: [
      { id: "barang-masuk", title: "Barang Masuk (Inbound)", icon: Inbox, link: "/dashboard/barang-masuk", comingSoon: true },
      { id: "barang-keluar", title: "Barang Keluar (Outbound)", icon: Send, link: "/dashboard/barang-keluar", comingSoon: true },
      {
        id: "manajemen-rak",
        title: "Manajemen Rak & Lokasi",
        icon: Archive,
        link: "/dashboard/manajemen-rak",
        subs: [
          { title: "Lokasi Gudang", link: "/dashboard/manajemen-rak/lokasi" },
        ],
      },
    ],
  },
  {
    id: "keuangan",
    title: "Keuangan",
    icon: CircleDollarSign,
    zone: "fin",
    items: [
      { id: "piutang", title: "Piutang (Tagihan Masuk)", icon: ReceiptText, link: "/dashboard/piutang", comingSoon: true },
      { id: "hutang", title: "Hutang", icon: HandCoins, link: "/dashboard/hutang", comingSoon: true },
      { id: "kas-bank", title: "Kas & Bank", icon: Landmark, link: "/dashboard/kas-bank", comingSoon: true },
      { id: "jurnal", title: "Jurnal", icon: BookOpen, link: "/dashboard/jurnal", comingSoon: true },
      { id: "aset", title: "Aset", icon: Building2, link: "/dashboard/aset", comingSoon: true },
      { id: "peta-akun", title: "Peta Akun", icon: Map, link: "/dashboard/peta-akun", comingSoon: true },
    ],
  },
  {
    id: "laporan",
    title: "Laporan",
    icon: BarChart3,
    zone: "fin",
    items: [
      { id: "laporan-penjualan", title: "Laporan Penjualan", icon: TrendingUp, link: "/dashboard/laporan/penjualan", comingSoon: true },
      { id: "laporan-pembelian", title: "Laporan Pembelian", icon: TrendingDown, link: "/dashboard/laporan/pembelian", comingSoon: true },
      { id: "laporan-inventori", title: "Laporan Inventori", icon: PackageOpen, link: "/dashboard/laporan/inventori", comingSoon: true },
      { id: "laporan-gudang", title: "Laporan Gudang", icon: Factory, link: "/dashboard/laporan/gudang", comingSoon: true },
      { id: "laporan-keuangan", title: "Laporan Keuangan", icon: CircleDollarSign, link: "/dashboard/laporan/keuangan", comingSoon: true },
    ],
  },
];

export const settingsRoutes: Route[] = [
  { id: "pengaturan", title: "Pengaturan", icon: Settings, link: "/dashboard/pengaturan" },
  { id: "bantuan", title: "Bantuan", icon: HelpCircle, link: "/dashboard/bantuan" },
];

export const sampleNotifications = [
  { id: "1", avatar: "/avatars/01.png", fallback: "OM", text: "New order received.", time: "10m ago" },
];

function linkMatchLen(pathname: string, link: string): number {
  return pathname === link || pathname.startsWith(link + "/") ? link.length : -1;
}

function routeMatchLen(pathname: string, route: Route): number {
  let best = linkMatchLen(pathname, route.link);
  route.subs?.forEach((s) => {
    best = Math.max(best, linkMatchLen(pathname, s.link));
    s.subs?.forEach((n) => {
      best = Math.max(best, linkMatchLen(pathname, n.link));
    });
  });
  return best;
}

export function findGroupIdForPath(pathname: string, groups: NavGroup[]): string {
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
