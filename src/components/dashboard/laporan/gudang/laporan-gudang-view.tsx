"use client";

import * as React from "react";
import {
  BarChart3Icon,
  ClipboardListIcon,
  PackageCheckIcon,
  RepeatIcon,
  TruckIcon,
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
import { TransferReportDialog } from "./transfer-report-dialog";
import { PicklistReportDialog } from "./picklist-report-dialog";
import { ShipmentReportDialog } from "./shipment-report-dialog";
import { OrderPerformanceDialog } from "./order-performance-dialog";
import { PutawayPerformanceDialog } from "./putaway-performance-dialog";
import { PutawayListDialog } from "./putaway-list-dialog";
import { ShipmentByCourierDialog } from "./shipment-by-courier-dialog";

type ActiveDialog =
  | "transfer"
  | "picklist"
  | "pengiriman"
  | "performa-pesanan"
  | "performa-penempatan"
  | "penempatan-barang"
  | "pengiriman-ekspedisi"
  | null;

export function LaporanGudangView() {
  const [active, setActive] = React.useState<ActiveDialog>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <ReportCard
          icon={<RepeatIcon className="size-5" />}
          title="Transfer"
          description="Daftar barang transfer masuk dan keluar per rentang tanggal dan SKU."
          actionLabel="Cetak Transfer"
          onClick={() => setActive("transfer")}
        />
        <ReportCard
          icon={<ClipboardListIcon className="size-5" />}
          title="Daftar Picklist"
          description="Rekap picklist per rentang tanggal, atau detail satu picklist berikut foto dan rak."
          actionLabel="Cetak Picklist"
          onClick={() => setActive("picklist")}
        />
        <ReportCard
          icon={<TruckIcon className="size-5" />}
          title="Daftar Pengiriman"
          description="Laporan manifest pengiriman berikut kurir, resi, dan status pesanan."
          actionLabel="Cetak Pengiriman"
          onClick={() => setActive("pengiriman")}
        />
        <ReportCard
          icon={<BarChart3Icon className="size-5" />}
          title="Performa Proses Pesanan"
          description="Performa picker, packer, shipper, dan kurir, atau rincian durasi tiap tahapan pesanan."
          actionLabel="Cetak Performa"
          onClick={() => setActive("performa-pesanan")}
        />
        <ReportCard
          icon={<BarChart3Icon className="size-5" />}
          title="Performa Proses Penempatan"
          description="Performa putaway per petugas berikut rata-rata durasi penempatan."
          actionLabel="Cetak Penempatan"
          onClick={() => setActive("performa-penempatan")}
        />
        <ReportCard
          icon={<PackageCheckIcon className="size-5" />}
          title="Penempatan Barang"
          description="Rincian isi penempatan per tanggal dan lokasi, berikut sumber penerimaan dan rak tujuan."
          actionLabel="Cetak Penempatan Barang"
          onClick={() => setActive("penempatan-barang")}
        />
        <ReportCard
          icon={<TruckIcon className="size-5" />}
          title="Pengiriman per Ekspedisi"
          description="Rekap pesanan dan kuantitas dikelompokkan per ekspedisi, dalam mode detail atau ringkasan."
          actionLabel="Cetak Pengiriman per Ekspedisi"
          onClick={() => setActive("pengiriman-ekspedisi")}
        />
      </div>

      <TransferReportDialog
        open={active === "transfer"}
        onOpenChange={(o) => setActive(o ? "transfer" : null)}
      />
      <PicklistReportDialog
        open={active === "picklist"}
        onOpenChange={(o) => setActive(o ? "picklist" : null)}
      />
      <ShipmentReportDialog
        open={active === "pengiriman"}
        onOpenChange={(o) => setActive(o ? "pengiriman" : null)}
      />
      <OrderPerformanceDialog
        open={active === "performa-pesanan"}
        onOpenChange={(o) => setActive(o ? "performa-pesanan" : null)}
      />
      <PutawayPerformanceDialog
        open={active === "performa-penempatan"}
        onOpenChange={(o) => setActive(o ? "performa-penempatan" : null)}
      />
      <PutawayListDialog
        open={active === "penempatan-barang"}
        onOpenChange={(o) => setActive(o ? "penempatan-barang" : null)}
      />
      <ShipmentByCourierDialog
        open={active === "pengiriman-ekspedisi"}
        onOpenChange={(o) => setActive(o ? "pengiriman-ekspedisi" : null)}
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
