"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import type {
  DownloadState,
  DownloadTransaction,
} from "@/hooks/master-produk/use-download";

const STATE_BAR: Record<DownloadState, string> = {
  queued: "bg-amber-500",
  downloading: "bg-primary",
  done: "bg-emerald-500",
  failed: "bg-destructive",
};

export function buildProgressColumns(
  onOpen: (trx: DownloadTransaction) => void,
): ColumnDef<DownloadTransaction>[] {
  return [
    {
      id: "trx_no",
      header: "No. Transaksi",
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => onOpen(row.original)}
          className="font-medium text-primary hover:underline"
        >
          {row.original.trxNo}
        </button>
      ),
    },
    {
      id: "created_date",
      header: "Tanggal",
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {formatDateTime(row.original.createdDate)}
        </span>
      ),
    },
    {
      id: "executed_by",
      header: "Pengguna",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.executedBy || "system"}</span>
      ),
    },
    {
      id: "store",
      header: "Store",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.original.storeName ?? "—"}
          </span>
          {row.original.channelName && (
            <span className="text-xs text-muted-foreground">
              {row.original.channelName}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const {
          state,
          totalDownloaded,
          allProduct,
          progressPercent,
          errorMessage,
        } = row.original;
        const pct = Math.min(100, Math.max(0, progressPercent));
        return (
          <div className="flex min-w-40 flex-col gap-1">
            <div className="flex items-center justify-between gap-2 text-xs">
              <StatusBadge
                domain="download-task"
                status={state}
                className="px-1.5 py-0 text-[11px]"
              />
              <span className="tabular-nums text-muted-foreground">
                {totalDownloaded}/{allProduct}
              </span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  STATE_BAR[state],
                )}
                style={{ width: `${pct}%` }}
              />
            </div>
            {state === "failed" && errorMessage && (
              <span
                className="truncate text-xs text-destructive"
                title={errorMessage}
              >
                {errorMessage}
              </span>
            )}
          </div>
        );
      },
    },
  ];
}
