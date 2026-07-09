"use client";

import * as React from "react";
import { formatDateTime } from "@/lib/format";
import type { PaginationState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  FileSpreadsheetIcon,
  ImportIcon,
  Loader2Icon,
  RefreshCwIcon,
  SearchXIcon,
  XCircleIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import {
  useOrderImportBatches,
  type OrderImportBatch,
  type OrderImportBatchState,
} from "@/hooks/pesanan/use-order-import";
import { OrderImportDialog } from "./import-dialog";
import { OrderImportErrorSheet } from "./import-error-sheet";

function stateLabel(state: OrderImportBatchState) {
  switch (state) {
    case "queued":
      return "Menunggu";
    case "processing":
      return "Diproses";
    case "done":
      return "Selesai";
    case "done_with_errors":
      return "Selesai (Error)";
    case "failed":
      return "Gagal";
  }
}

function StateIcon({ state }: { state: OrderImportBatchState }) {
  switch (state) {
    case "queued":
      return <ClockIcon className="size-4 text-muted-foreground" />;
    case "processing":
      return <Loader2Icon className="size-4 animate-spin text-blue-500" />;
    case "done":
      return <CheckCircle2Icon className="size-4 text-success" />;
    case "done_with_errors":
      return <AlertTriangleIcon className="size-4 text-warning" />;
    case "failed":
      return <XCircleIcon className="size-4 text-destructive" />;
  }
}

function ProgressBar({
  percent,
  state,
}: {
  percent: number;
  state: OrderImportBatchState;
}) {
  const color =
    state === "failed"
      ? "bg-destructive"
      : state === "done_with_errors"
        ? "bg-warning"
        : state === "done"
          ? "bg-success"
          : "bg-primary";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
      <span className="tabular-nums text-xs text-muted-foreground">
        {percent}%
      </span>
    </div>
  );
}

function buildColumns(
  onViewErrors: (b: OrderImportBatch) => void,
): ColumnDef<OrderImportBatch>[] {
  return [
    {
      accessorKey: "batchNo",
      header: "Batch",
      cell: ({ row }) => (
        <span className="font-mono text-xs text-primary">
          {row.original.batchNo}
        </span>
      ),
    },
    {
      accessorKey: "originalFilename",
      header: "File",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-4 shrink-0 text-success" />
          <span className="max-w-[200px] truncate">
            {row.original.originalFilename}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "Status",
      size: 150,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <StateIcon state={b.state} />
            <span className="text-sm">{stateLabel(b.state)}</span>
          </div>
        );
      },
    },
    {
      id: "progress",
      header: "Progress",
      size: 180,
      cell: ({ row }) => (
        <ProgressBar
          percent={row.original.progressPercent}
          state={row.original.state}
        />
      ),
    },
    {
      id: "rows",
      header: "Baris",
      size: 160,
      cell: ({ row }) => {
        const b = row.original;
        if (b.state === "queued")
          return <span className="text-sm text-muted-foreground">—</span>;
        return (
          <div className="flex gap-3 text-xs">
            <span className="text-muted-foreground">Total {b.totalRows}</span>
            {b.successRows > 0 && (
              <span className="text-success">{b.successRows} OK</span>
            )}
            {b.failedRows > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewErrors(b);
                }}
                className="font-medium text-destructive hover:underline"
              >
                {b.failedRows} gagal
              </button>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Tanggal",
      size: 160,
      cell: ({ row }) => {
        const d = row.original.createdAt;
        if (!d) return "—";
        return (
          <span className="text-sm tabular-nums text-muted-foreground">
            {formatDateTime(d)}
          </span>
        );
      },
    },
  ];
}

export function OrderImportView() {
  const [importOpen, setImportOpen] = React.useState(false);
  const [errorBatch, setErrorBatch] = React.useState<OrderImportBatch | null>(
    null,
  );

  const [stateFilter, setStateFilter] = React.useState<
    "all" | OrderImportBatchState
  >("all");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const query = useOrderImportBatches({
    state: stateFilter === "all" ? undefined : stateFilter,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.meta?.total ?? 0;
  const columns = React.useMemo(() => buildColumns(setErrorBatch), []);

  return (
    <>
      <LiquidGlass
        radius={24}
        intensity="default"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2">
            <ImportIcon className="size-5 text-primary" />
            <h2 className="font-semibold">Import Pesanan</h2>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="sm"
              className="h-9 gap-2"
              onClick={() => setImportOpen(true)}
            >
              <ImportIcon className="size-4" />
              Import Baru
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => query.refetch()}
              disabled={query.isFetching}
              title="Muat ulang"
            >
              <RefreshCwIcon
                className={cn(
                  "size-4",
                  query.isFetching && "animate-spin motion-reduce:animate-none",
                )}
              />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-border/40 px-4 py-2.5 sm:px-5">
          <Select
            value={stateFilter}
            onValueChange={(v) => {
              setStateFilter(v as "all" | OrderImportBatchState);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="w-[180px] rounded-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="queued">Menunggu</SelectItem>
              <SelectItem value="processing">Diproses</SelectItem>
              <SelectItem value="done">Selesai</SelectItem>
              <SelectItem value="done_with_errors">Selesai (Error)</SelectItem>
              <SelectItem value="failed">Gagal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="px-4 py-5 sm:px-5">
          {query.isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <AlertTriangleIcon className="size-8 text-destructive" />
              <p className="font-medium">Gagal memuat data import</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => query.refetch()}
                disabled={query.isFetching}
              >
                Coba lagi
              </Button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={items}
              isLoading={query.isLoading}
              getRowId={(b) => b.id}
              hideToolbar
              manualPagination
              rowCount={total}
              pagination={pagination}
              onPaginationChange={setPagination}
              tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
              emptyState={
                <EmptyState
                  icon={SearchXIcon}
                  title="Belum ada riwayat import"
                  description="Klik Import Baru untuk mengupload file pesanan."
                  className="py-6"
                />
              }
            />
          )}
        </div>
      </LiquidGlass>

      <OrderImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onQueued={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
      />

      <OrderImportErrorSheet
        batch={errorBatch}
        open={!!errorBatch}
        onOpenChange={(o) => !o && setErrorBatch(null)}
      />
    </>
  );
}
