"use client";

import {
  WalletIcon,
  ShoppingCartIcon,
  TruckIcon,
  BoxesIcon,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/types/dashboard/dashboard";
import { StatCard, type StatCardProps } from "./stat-card";

interface KpiRowProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

/** Ikhtisar: metrik pemantauan yang tidak punya tabel antrian di bawah. */
export function KpiRow({ summary, isLoading }: KpiRowProps) {
  const cards: StatCardProps[] = [
    {
      label: "Omzet (periode)",
      value: formatCurrency(summary?.revenue),
      icon: WalletIcon,
      tone: "success",
      emphasis: "lg",
    },
    {
      label: "Total Pesanan",
      value: formatNumber(summary?.orders_total),
      icon: ShoppingCartIcon,
      emphasis: "lg",
    },
    {
      label: "Dalam Pengiriman",
      value: formatNumber(summary?.in_transit),
      hint: "Pesanan menuju pelanggan",
      icon: TruckIcon,
    },
    {
      label: "Nilai Stok",
      value: formatCurrency(summary?.stock_value),
      hint: "Total persediaan tersimpan",
      icon: BoxesIcon,
      href: "/dashboard/monitor-stok",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
