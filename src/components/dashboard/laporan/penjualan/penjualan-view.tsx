"use client";

import * as React from "react";
import {
  BarChart3Icon,
  ReceiptTextIcon,
  RotateCcwIcon,
  ShoppingCartIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PenjualanDialog } from "./penjualan-dialog";
import { PenjualanProdukDialog } from "./penjualan-produk-dialog";
import { PenjualanReturDialog } from "./penjualan-retur-dialog";
import { RincianPendapatanDialog } from "./rincian-pendapatan-dialog";

type ActiveDialog =
  | "penjualan"
  | "penjualan-produk"
  | "retur-penjualan"
  | "rincian-pendapatan"
  | null;

export function PenjualanView() {
  const [active, setActive] = React.useState<ActiveDialog>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ReportCard
          icon={<ShoppingCartIcon className="size-5" />}
          title="Penjualan"
          description="Daftar penjualan per pesanan berikut channel, toko, kurir, status, dan rincian nilai — unduh sebagai Excel."
          actionLabel="Unduh Excel"
          onClick={() => setActive("penjualan")}
        />
        <ReportCard
          icon={<BarChart3Icon className="size-5" />}
          title="Penjualan Produk"
          description="Penjualan per produk/SKU (1 baris per barang pesanan), filter SKU dan lokasi — unduh Excel."
          actionLabel="Unduh Excel"
          onClick={() => setActive("penjualan-produk")}
        />
        <ReportCard
          icon={<BarChart3Icon className="size-5" />}
          title="Analisa Data Penjualan"
          description="Analisa tren penjualan lintas periode, channel, dan produk."
          comingSoon
        />
        <ReportCard
          icon={<RotateCcwIcon className="size-5" />}
          title="Retur Penjualan"
          description="Retur penjualan per barang berikut rak putaway, resi, dan nilai pengembalian — unduh Excel."
          actionLabel="Unduh Excel"
          onClick={() => setActive("retur-penjualan")}
        />
        <ReportCard
          icon={<WalletIcon className="size-5" />}
          title="Rincian Pendapatan"
          description="Pendapatan bersih, HPP, dan laba kotor per faktur atau per barang — unduh Excel."
          actionLabel="Unduh Excel"
          onClick={() => setActive("rincian-pendapatan")}
        />
        <ReportCard
          icon={<UsersIcon className="size-5" />}
          title="Daftar Pelanggan"
          description="Daftar pelanggan berikut kontak dan ringkasan transaksi."
          comingSoon
        />
        <ReportCard
          icon={<ReceiptTextIcon className="size-5" />}
          title="Cetak Struk"
          description="Cetak struk penjualan per pesanan."
          comingSoon
        />
      </div>

      <PenjualanDialog
        open={active === "penjualan"}
        onOpenChange={(o) => setActive(o ? "penjualan" : null)}
      />
      <PenjualanProdukDialog
        open={active === "penjualan-produk"}
        onOpenChange={(o) => setActive(o ? "penjualan-produk" : null)}
      />
      <PenjualanReturDialog
        open={active === "retur-penjualan"}
        onOpenChange={(o) => setActive(o ? "retur-penjualan" : null)}
      />
      <RincianPendapatanDialog
        open={active === "rincian-pendapatan"}
        onOpenChange={(o) => setActive(o ? "rincian-pendapatan" : null)}
      />
    </>
  );
}

type ReportCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
} & (
  | { comingSoon: true; actionLabel?: never; onClick?: never }
  | { comingSoon?: false; actionLabel: string; onClick: () => void }
);

function ReportCard({
  icon,
  title,
  description,
  actionLabel,
  onClick,
  comingSoon,
}: ReportCardProps) {
  return (
    <Card className={comingSoon ? "opacity-50" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          {comingSoon && <Badge variant="muted">Segera</Badge>}
        </div>
        <CardTitle className="mt-3">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {!comingSoon && (
        <CardContent className="mt-auto">
          <Button variant="primary" onClick={onClick}>
            {actionLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
