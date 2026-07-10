"use client";

import { useMemo } from "react";
import {
  PackageCheckIcon,
  PackageXIcon,
  AlertTriangleIcon,
  XCircleIcon,
} from "lucide-react";

import { useDashboardSummary } from "@/hooks/dashboard/use-dashboard";
import { KpiRow } from "./kpi-row";
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

  return (
    <div className="flex flex-col gap-6">
      <KpiRow summary={summary} isLoading={isLoading} />

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
    </div>
  );
}
