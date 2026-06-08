"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Home,
  Package2,
  Tag,
  FolderTree,
  ShoppingCart,
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
  LogOut,
  Store
} from "lucide-react";
import { Logo } from "@/components/dashboard/sidebar/logo";
import type { Route } from "./nav-main";
import DashboardNavigation from "@/components/dashboard/sidebar/nav-main";
import { NotificationsPopover } from "@/components/dashboard/sidebar/nav-notifications";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Quick fade for inline text/controls so they resolve within the 0.3s width
// animation instead of popping in/out. Same easing as the container transition.
const FADE_TRANSITION = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
};

const sampleNotifications = [
  {
    id: "1",
    avatar: "/avatars/01.png",
    fallback: "OM",
    text: "New order received.",
    time: "10m ago",
  },
];

const dashboardGroups: { label?: string; items: Route[] }[] = [
  {
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: Home,
        link: "/dashboard",
      },
    ],
  },
  {
    label: "KATALOG",
    items: [
      {
        id: "produk",
        title: "Produk",
        icon: Package2,
        link: "/dashboard/produk",
        subs: [
          { title: "Tarik Produk", link: "/dashboard/produk/tarik" },
          { title: "Menunggu Review", link: "/dashboard/produk/review" },
          { title: "Data Master", link: "/dashboard/produk/master" },
          { title: "Produk Bundle", link: "/dashboard/produk/bundle" },
          { title: "Naikkan Produk", link: "/dashboard/produk/naikkan" },
          { title: "Arsip Produk", link: "/dashboard/produk/arsip" },
        ],
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
      {
        id: "listing-marketplace",
        title: "Listing Marketplace",
        icon: ShoppingCart,
        link: "/dashboard/listing-marketplace",
      },
    ],
  },
  {
    label: "PERSEDIAAN",
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
      {
        id: "monitor-stok",
        title: "Monitor Stok",
        icon: Eye,
        link: "/dashboard/monitor-stok",
      },
      {
        id: "stok-terpesan",
        title: "Stok Terpesan",
        icon: PackageCheck,
        link: "/dashboard/stok-terpesan",
      },
    ],
  },
  {
    label: "PENJUALAN",
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
      {
        id: "kontak-pelanggan",
        title: "Kontak Pelanggan",
        icon: Users,
        link: "/dashboard/kontak-pelanggan",
      },
      {
        id: "kasir-pos",
        title: "Kasir (POS)",
        icon: MonitorSmartphone,
        link: "/dashboard/kasir-pos",
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
    label: "PEMBELIAN",
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
      {
        id: "retur-pembelian",
        title: "Retur Pembelian",
        icon: CornerUpLeft,
        link: "/dashboard/retur-pembelian",
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
    label: "GUDANG",
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
          { title: "Denah Rak", link: "/dashboard/manajemen-rak/denah" },
        ],
      },
    ],
  },
  {
    label: "KEUANGAN",
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
      {
        id: "kas-bank",
        title: "Kas & Bank",
        icon: Landmark,
        link: "/dashboard/kas-bank",
      },
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
      {
        id: "aset",
        title: "Aset",
        icon: Building2,
        link: "/dashboard/aset",
      },
      {
        id: "peta-akun",
        title: "Peta Akun",
        icon: Map,
        link: "/dashboard/peta-akun",
      },
    ],
  },
  {
    label: "LAPORAN",
    items: [
      { id: "laporan-penjualan", title: "Laporan Penjualan", icon: TrendingUp, link: "/dashboard/laporan/penjualan" },
      { id: "laporan-pembelian", title: "Laporan Pembelian", icon: TrendingDown, link: "/dashboard/laporan/pembelian" },
      { id: "laporan-inventori", title: "Laporan Inventori", icon: PackageOpen, link: "/dashboard/laporan/inventori" },
      { id: "laporan-gudang", title: "Laporan Gudang", icon: Factory, link: "/dashboard/laporan/gudang" },
      { id: "laporan-keuangan", title: "Laporan Keuangan", icon: CircleDollarSign, link: "/dashboard/laporan/keuangan" },
    ],
  },
];

const settingsRoutes: Route[] = [
  { id: "pengaturan", title: "Pengaturan", icon: Settings, link: "/dashboard/pengaturan" },
  { id: "bantuan", title: "Bantuan", icon: HelpCircle, link: "/dashboard/bantuan" },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="flex flex-col gap-y-3 md:pt-3.5">
        <div
          className={cn(
            "flex w-full items-center gap-2",
            isCollapsed ? "flex-col" : "justify-between"
          )}
        >
          <a href="#" className="flex min-w-0 items-center gap-2">
            <Logo className="h-8 w-8 shrink-0 text-primary" />
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={FADE_TRANSITION}
                className="overflow-hidden whitespace-nowrap font-bold text-lg text-black dark:text-white"
              >
                UltraFit WMS
              </motion.span>
            )}
          </a>

          <div className={cn("flex items-center gap-2", isCollapsed && "flex-col")}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={FADE_TRANSITION}
              >
                <NotificationsPopover notifications={sampleNotifications} />
              </motion.div>
            )}
            <SidebarTrigger />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="gap-0 px-2 py-4">
        {dashboardGroups.map((group, index) => (
          <SidebarGroup key={index} className="py-2 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-0">
            {group.label && (
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <DashboardNavigation routes={group.items} />
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="px-4 py-4 space-y-4 border-t border-sidebar-border group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:items-center">
        <DashboardNavigation routes={settingsRoutes} />
        
        <div className={cn("flex items-center mt-auto", isCollapsed ? "justify-center" : "justify-between")}>
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">DA</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={FADE_TRANSITION}
                className="flex flex-col overflow-hidden whitespace-nowrap"
              >
                <span className="text-sm font-semibold">Darel</span>
                <span className="text-xs text-muted-foreground">Admin</span>
              </motion.div>
            )}
          </div>
          {!isCollapsed && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={FADE_TRANSITION}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
