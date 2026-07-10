"use client";

import {
  WalletIcon,
  ShoppingCartIcon,
  PackageCheckIcon,
  PackageXIcon,
  AlertTriangleIcon,
  XCircleIcon,
  TruckIcon,
  Undo2Icon,
} from "lucide-react";

import { formatCurrency, formatNumber } from "@/lib/format";
import type { DashboardSummary } from "@/types/dashboard/dashboard";
import { StatCard, type StatCardProps } from "./stat-card";

interface KpiRowProps {
  summary?: DashboardSummary;
  isLoading: boolean;
}

export function KpiRow({ summary, isLoading }: KpiRowProps) {
  const cards: StatCardProps[] = [
    {
      label: "Omzet (periode)",
      value: formatCurrency(summary?.revenue),
      icon: WalletIcon,
      tone: "success",
    },
    {
      label: "Total Pesanan",
      value: formatNumber(summary?.orders_total),
      icon: ShoppingCartIcon,
    },
    {
      label: "Siap Proses",
      value: formatNumber(summary?.ready_to_process),
      hint: "Pesanan menunggu diproses",
      icon: PackageCheckIcon,
      tone: "success",
    },
    {
      label: "Stok Kosong",
      value: formatNumber(summary?.empty_stock),
      hint: "Pesanan tanpa stok cukup",
      icon: PackageXIcon,
      tone: "destructive",
    },
    {
      label: "Gagal Picking",
      value: formatNumber(summary?.failed_pick),
      icon: AlertTriangleIcon,
      tone: "warning",
    },
    {
      label: "Permintaan Batal",
      value: formatNumber(summary?.pending_cancel),
      icon: XCircleIcon,
      tone: "warning",
    },
    {
      label: "Dalam Pengiriman",
      value: formatNumber(summary?.in_transit),
      icon: TruckIcon,
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
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} isLoading={isLoading} />
      ))}
    </div>
  );
}
