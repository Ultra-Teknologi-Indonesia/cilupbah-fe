"use client";

import {
  BoxesIcon,
  PackageXIcon,
  ShoppingCartIcon,
  TrendingDownIcon,
  TruckIcon,
  Undo2Icon,
  WalletIcon,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/format";
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
      label: `Omzet · ${periodLabel}`,
      value: formatCurrency(summary?.revenue),
      icon: WalletIcon,
      tone: "success",
      emphasis: "hero",
      className: "sm:col-span-2",
    },
    {
      label: "Total pesanan",
      value: formatNumber(summary?.orders_total),
      hint: periodLabel,
      icon: ShoppingCartIcon,
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
      label: "Nilai stok",
      value: formatCurrency(summary?.stock_value),
      hint: "Total persediaan tersimpan",
      icon: BoxesIcon,
      href: "/dashboard/monitor-stok",
    },
    {
      label: "Stok menipis",
      value: formatNumber(summary?.stock_menipis),
      hint: "Mendekati batas minimum",
      icon: TrendingDownIcon,
      tone: "warning",
      href: "/dashboard/monitor-stok",
    },
    {
      label: "Stok habis",
      value: formatNumber(summary?.stock_habis),
      hint: "Tanpa stok tersedia",
      icon: PackageXIcon,
      tone: "destructive",
      href: "/dashboard/monitor-stok",
    },
    {
      label: "Retur pending",
      value: formatNumber(summary?.returns_pending),
      hint: summary
        ? `Refund ${formatCurrency(summary.returns_refund)}`
        : undefined,
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
          Kesehatan stok &amp; retur
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {health.map((card) => (
            <StatCard key={card.label} {...card} isLoading={isLoading} />
          ))}
        </div>
      </div>
    </div>
  );
}
