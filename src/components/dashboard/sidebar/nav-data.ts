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
        subs: [
          { title: "Daftar Harga", link: "/dashboard/harga-promosi/daftar" },
          { title: "Promosi", link: "/dashboard/harga-promosi/promosi" },
        ],
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
      {
        id: "posisi-stok",
        title: "Posisi Stok",
        icon: BarChart2,
        link: "/dashboard/posisi-stok",
        subs: [
          { title: "Per Produk", link: "/dashboard/posisi-stok/produk" },
          { title: "Per Gudang", link: "/dashboard/posisi-stok/gudang" },
          { title: "Perlu Restock", link: "/dashboard/posisi-stok/restock" },
          { title: "Stok Habis", link: "/dashboard/posisi-stok/habis" },
        ],
      },
      {
        id: "transaksi-stok",
        title: "Transaksi Stok",
        icon: RefreshCw,
        link: "/dashboard/transaksi-stok",
        subs: [
          { title: "Penyesuaian Stok", link: "/dashboard/transaksi-stok/penyesuaian" },
          {
            title: "Transfer Stok",
            link: "/dashboard/transaksi-stok/transfer",
            subs: [
              { title: "Masuk", link: "/dashboard/transaksi-stok/transfer/masuk" },
              { title: "Keluar", link: "/dashboard/transaksi-stok/transfer/keluar" },
              { title: "Transit", link: "/dashboard/transaksi-stok/transfer/transit" },
            ],
          },
          { title: "Stok Opname", link: "/dashboard/transaksi-stok/opname" },
        ],
      },
      { id: "monitor-stok", title: "Monitor Stok", icon: Eye, link: "/dashboard/monitor-stok" },
      { id: "stok-terpesan", title: "Stok Terpesan", icon: PackageCheck, link: "/dashboard/stok-terpesan" },
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
        subs: [
          { title: "Siap Proses", link: "/dashboard/pesanan/siap-proses" },
          { title: "Siap Picking", link: "/dashboard/pesanan/siap-picking" },
          { title: "Dalam Pengiriman", link: "/dashboard/pesanan/dalam-pengiriman" },
          { title: "Selesai", link: "/dashboard/pesanan/selesai" },
          { title: "Dibatalkan", link: "/dashboard/pesanan/dibatalkan" },
        ],
      },
      {
        id: "retur-penjualan",
        title: "Retur Penjualan",
        icon: CornerDownLeft,
        link: "/dashboard/retur-penjualan",
        subs: [
          { title: "Menunggu Proses", link: "/dashboard/retur-penjualan/menunggu" },
          { title: "Diterima", link: "/dashboard/retur-penjualan/diterima" },
          { title: "Penyelesaian Retur", link: "/dashboard/retur-penjualan/penyelesaian" },
        ],
      },
      { id: "kontak-pelanggan", title: "Kontak Pelanggan", icon: Users, link: "/dashboard/kontak-pelanggan" },
      { id: "kasir-pos", title: "Kasir (POS)", icon: MonitorSmartphone, link: "/dashboard/kasir-pos" },
      { id: "integrasi-channel", title: "Integrasi Channel", icon: LinkIcon, link: "/dashboard/integrasi-channel" },
    ],
  },
  {
    id: "pembelian",
    title: "Pembelian",
    icon: ClipboardList,
    zone: "ops",
    items: [
      {
        id: "purchase-order",
        title: "Purchase Order",
        icon: ClipboardList,
        link: "/dashboard/purchase-order",
        subs: [
          { title: "Semua PO", link: "/dashboard/purchase-order/semua" },
          { title: "Progress Terima Barang", link: "/dashboard/purchase-order/progress" },
        ],
      },
      { id: "retur-pembelian", title: "Retur Pembelian", icon: CornerUpLeft, link: "/dashboard/retur-pembelian" },
      { id: "kontak-pemasok", title: "Kontak Pemasok", icon: Truck, link: "/dashboard/kontak-pemasok" },
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
        subs: [
          { title: "Daftar Penerimaan", link: "/dashboard/barang-masuk/daftar" },
          {
            title: "Putaway",
            link: "/dashboard/barang-masuk/putaway",
            subs: [
              { title: "Belum Dimulai", link: "/dashboard/barang-masuk/putaway/belum" },
              { title: "Dalam Proses", link: "/dashboard/barang-masuk/putaway/proses" },
              { title: "Selesai", link: "/dashboard/barang-masuk/putaway/selesai" },
            ],
          },
          { title: "Laporan Putaway", link: "/dashboard/barang-masuk/laporan" },
        ],
      },
      {
        id: "barang-keluar",
        title: "Barang Keluar (Outbound)",
        icon: Send,
        link: "/dashboard/barang-keluar",
        subs: [
          { title: "Picklist", link: "/dashboard/barang-keluar/picklist" },
          { title: "Packlist", link: "/dashboard/barang-keluar/packlist" },
          { title: "Jadwal Pengiriman", link: "/dashboard/barang-keluar/jadwal" },
        ],
      },
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
      {
        id: "piutang",
        title: "Piutang (Tagihan Masuk)",
        icon: ReceiptText,
        link: "/dashboard/piutang",
        subs: [
          { title: "Invoice", link: "/dashboard/piutang/invoice" },
          { title: "Pembayaran Invoice", link: "/dashboard/piutang/pembayaran" },
        ],
      },
      {
        id: "hutang",
        title: "Hutang",
        icon: HandCoins,
        link: "/dashboard/hutang",
        subs: [
          { title: "Bill / Tagihan", link: "/dashboard/hutang/bill" },
          { title: "Pembayaran Bill", link: "/dashboard/hutang/pembayaran" },
        ],
      },
      { id: "kas-bank", title: "Kas & Bank", icon: Landmark, link: "/dashboard/kas-bank" },
      {
        id: "jurnal",
        title: "Jurnal",
        icon: BookOpen,
        link: "/dashboard/jurnal",
        subs: [
          { title: "Manual Journal", link: "/dashboard/jurnal/manual" },
          { title: "Transaksi Rutin", link: "/dashboard/jurnal/rutin" },
        ],
      },
      { id: "aset", title: "Aset", icon: Building2, link: "/dashboard/aset" },
      { id: "peta-akun", title: "Peta Akun", icon: Map, link: "/dashboard/peta-akun" },
    ],
  },
  {
    id: "laporan",
    title: "Laporan",
    icon: BarChart3,
    zone: "fin",
    items: [
      { id: "laporan-penjualan", title: "Laporan Penjualan", icon: TrendingUp, link: "/dashboard/laporan/penjualan" },
      { id: "laporan-pembelian", title: "Laporan Pembelian", icon: TrendingDown, link: "/dashboard/laporan/pembelian" },
      { id: "laporan-inventori", title: "Laporan Inventori", icon: PackageOpen, link: "/dashboard/laporan/inventori" },
      { id: "laporan-gudang", title: "Laporan Gudang", icon: Factory, link: "/dashboard/laporan/gudang" },
      { id: "laporan-keuangan", title: "Laporan Keuangan", icon: CircleDollarSign, link: "/dashboard/laporan/keuangan" },
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
