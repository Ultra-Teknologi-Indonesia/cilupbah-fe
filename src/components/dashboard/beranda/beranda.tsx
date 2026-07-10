"use client";

import { useMemo } from "react";
import {
  PackageCheckIcon,
  PackageXIcon,
  AlertTriangleIcon,
  XCircleIcon,
  TrendingDownIcon,
  Undo2Icon,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/format";
import { useDashboardSummary } from "@/hooks/dashboard/use-dashboard";
import { KpiRow } from "./kpi-row";
import { StatCard, type StatCardProps } from "./stat-card";
import { ActionQueueTable } from "./action-queue-table";

/** Rentang default 30 hari terakhir untuk metrik omzet/pesanan. */
function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return { date_from: iso(from), date_to: iso(to) };
}

export function Beranda() {
  const params = useMemo(() => defaultRange(), []);
  const { data: summary, isLoading } = useDashboardSummary(params);

  const stockHealth: StatCardProps[] = [
    {
      label: "Stok Menipis",
      value: formatNumber(summary?.stock_menipis),
      hint: "Produk mendekati batas minimum",
      icon: TrendingDownIcon,
      tone: "warning",
      href: "/dashboard/monitor-stok",
    },
    {
      label: "Stok Habis",
      value: formatNumber(summary?.stock_habis),
      hint: "Produk tanpa stok tersedia",
      icon: PackageXIcon,
      tone: "destructive",
      href: "/dashboard/monitor-stok",
    },
    {
      label: "Retur Pending",
      value: formatNumber(summary?.returns_pending),
      hint: summary
        ? `Refund ${formatCurrency(summary.returns_refund)}`
        : undefined,
      icon: Undo2Icon,
      tone: "warning",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <KpiRow summary={summary} isLoading={isLoading} />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Perlu ditindak</h2>
          <p className="text-xs text-muted-foreground">
            Antrian pesanan yang menunggu tindakan operasional.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <ActionQueueTable
            queue="ready-to-process"
            title="Siap Diproses"
            icon={PackageCheckIcon}
            emptyMessage="Semua pesanan yang siap sudah diproses."
            viewAllHref="/dashboard/pesanan?tab=ready-to-process"
          />
          <ActionQueueTable
            queue="empty-stock"
            title="Stok Kosong"
            icon={PackageXIcon}
            emptyMessage="Tidak ada pesanan dengan stok kurang."
            viewAllHref="/dashboard/pesanan?tab=empty-stock"
          />
          <ActionQueueTable
            queue="failed-pick"
            title="Gagal Picking"
            icon={AlertTriangleIcon}
            emptyMessage="Tidak ada pesanan gagal picking."
            viewAllHref="/dashboard/pesanan?tab=failed-pick"
          />
          <ActionQueueTable
            queue="pending-cancel"
            title="Permintaan Pembatalan"
            icon={XCircleIcon}
            emptyMessage="Tidak ada permintaan pembatalan."
            viewAllHref="/dashboard/pesanan?tab=cancellation"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-sm font-semibold">Kesehatan stok &amp; retur</h2>
          <p className="text-xs text-muted-foreground">
            Pantau ketersediaan persediaan dan retur yang belum tuntas.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stockHealth.map((card) => (
            <StatCard key={card.label} {...card} isLoading={isLoading} />
          ))}
        </div>
      </section>
    </div>
  );
}
