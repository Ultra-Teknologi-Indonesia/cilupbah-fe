"use client";

import {
  AlertTriangleIcon,
  PackageCheckIcon,
  PackageXIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TruckIcon,
  Undo2Icon,
  XCircleIcon,
} from "lucide-react";

import { formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/types/dashboard/dashboard";
import { StatCard, type StatCardProps } from "./stat-card";

interface KpiRowProps {
  summary?: DashboardSummary;
  isLoading: boolean;
  periodLabel: string;
}

export function KpiRow({ summary, isLoading, periodLabel }: KpiRowProps) {
  const primary: StatCardProps[] = [
    {
      label: `Pesanan masuk · ${periodLabel}`,
      value: formatNumber(summary?.orders_total),
      icon: ShoppingCartIcon,
      tone: "success",
      emphasis: "hero",
      className: "sm:col-span-2",
    },
    {
      label: "Siap diproses",
      value: formatNumber(summary?.ready_to_process),
      hint: "Menunggu pekerjaan gudang",
      icon: PackageCheckIcon,
      emphasis: "lg",
    },
    {
      label: "Dalam pengiriman",
      value: formatNumber(summary?.in_transit),
      hint: "Menuju pelanggan",
      icon: TruckIcon,
    },
  ];

  const health: StatCardProps[] = [
    {
      label: "Stok menipis",
      value: formatNumber(summary?.stock_menipis),
      hint: "Mendekati batas minimum",
      icon: TrendingDownIcon,
      tone: "warning",
      href: "/dashboard/monitor-stok",
    },
    {
      label: "Pesanan terkendala stok",
      value: formatNumber(summary?.empty_stock),
      hint: "Perlu tindak lanjut",
      icon: PackageXIcon,
      tone: "warning",
      href: "/dashboard/pesanan?tab=empty-stock",
    },
    {
      label: "Gagal picking",
      value: formatNumber(summary?.failed_pick),
      hint: "Perlu diperiksa",
      icon: AlertTriangleIcon,
      tone: "destructive",
      href: "/dashboard/pesanan?tab=failed-pick",
    },
    {
      label: "Pembatalan menunggu",
      value: formatNumber(summary?.pending_cancel),
      hint: "Menunggu keputusan",
      icon: XCircleIcon,
      tone: "warning",
      href: "/dashboard/pesanan?tab=cancellation",
    },
    {
      label: "Stok habis",
      value: formatNumber(summary?.stock_habis),
      hint: "Tanpa stok tersedia",
      icon: PackageXIcon,
      tone: "warning",
      href: "/dashboard/monitor-stok",
    },
    {
      label: "Retur perlu diproses",
      value: formatNumber(summary?.returns_pending),
      hint: "Menunggu tindakan gudang",
      icon: Undo2Icon,
      tone: "warning",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {primary.map((card) => (
          <StatCard key={card.label} {...card} isLoading={isLoading} />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Kesehatan operasional
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {health.map((card) => (
            <StatCard key={card.label} {...card} isLoading={isLoading} />
          ))}
        </div>
      </div>
    </div>
  );
}
