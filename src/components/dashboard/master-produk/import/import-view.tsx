"use client";

import * as React from "react";
import { formatDateTime } from "@/lib/format";
import type { PaginationState } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  ClockIcon,
  EyeIcon,
  FileSpreadsheetIcon,
  ImportIcon,
  LayersIcon,
  Loader2Icon,
  PackageIcon,
  RefreshCwIcon,
  SearchXIcon,
  XCircleIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { useImportBatches } from "@/hooks/master-produk/use-import";
import type {
  ImportBatch,
  ImportBatchState,
  ImportBatchType,
} from "@/hooks/master-produk/use-import";
import { ImportDialog } from "./import-dialog";
import { ImportRowSheet } from "./import-row-sheet";

function stateLabel(state: ImportBatchState) {
  switch (state) {
    case "queued":
      return "Menunggu";
    case "previewing":
      return "Validasi File";
    case "previewed":
      return "Siap Diterapkan";
    case "confirming":
    case "processing":
      return "Sedang Menerapkan";
    case "done":
      return "Selesai";
    case "done_with_errors":
      return "Selesai (Sebagian Error)";
    case "failed":
      return "Gagal";
  }
}

function StateBadge({ state }: { state: ImportBatchState }) {
  switch (state) {
    case "queued":
      return (
        <Badge
          variant="outline"
          className="border-muted-foreground/30 text-muted-foreground"
        >
          <ClockIcon className="mr-1 size-3" />
          Menunggu
        </Badge>
      );
    case "previewing":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse"
        >
          <Loader2Icon className="mr-1 size-3 animate-spin" />
          Validasi File
        </Badge>
      );
    case "previewed":
      return (
        <Badge
          variant="outline"
          className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
        >
          <CheckCircle2Icon className="mr-1 size-3" />
          Siap Diterapkan
        </Badge>
      );
    case "confirming":
    case "processing":
      return (
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary animate-pulse"
        >
          <Loader2Icon className="mr-1 size-3 animate-spin" />
          Menerapkan
        </Badge>
      );
    case "done":
      return (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          <CheckCircle2Icon className="mr-1 size-3" />
          Selesai
        </Badge>
      );
    case "done_with_errors":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <AlertTriangleIcon className="mr-1 size-3" />
          Selesai (Ada Error)
        </Badge>
      );
    case "failed":
      return (
        <Badge
          variant="outline"
          className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
        >
          <XCircleIcon className="mr-1 size-3" />
          Gagal
        </Badge>
      );
  }
}

function ProgressBar({
  percent,
  state,
}: {
  percent: number;
  state: ImportBatchState;
}) {
  const color =
    state === "failed"
      ? "bg-destructive"
      : state === "done_with_errors"
        ? "bg-amber-500"
        : state === "done"
          ? "bg-emerald-500"
          : "bg-primary";
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            color,
          )}
          style={{
            width: `${Math.min(100, Math.max(state === "previewing" || state === "confirming" ? 10 : 0, percent))}%`,
          }}
        />
      </div>
      <span className="tabular-nums text-xs text-muted-foreground font-medium">
        {percent}%
      </span>
    </div>
  );
}

function buildColumns(
  onViewDetails: (b: ImportBatch) => void,
): ColumnDef<ImportBatch>[] {
  return [
    {
      accessorKey: "batchNo",
      header: "No. Batch",
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-primary">
          {row.original.batchNo}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Tipe",
      size: 110,
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1 rounded-xl bg-muted/60 px-2 py-0.5 text-xs font-medium">
          {row.original.type === "single" ? (
            <>
              <PackageIcon className="size-3 text-muted-foreground" />
              Satuan
            </>
          ) : (
            <>
              <LayersIcon className="size-3 text-muted-foreground" />
              Bundle
            </>
          )}
        </span>
      ),
    },
    {
      accessorKey: "originalFilename",
      header: "Nama File",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheetIcon className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="max-w-[200px] truncate font-medium">
            {row.original.originalFilename}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "state",
      header: "Status",
      size: 160,
      cell: ({ row }) => <StateBadge state={row.original.state} />,
    },
    {
      id: "progress",
      header: "Progres",
      size: 160,
      cell: ({ row }) => (
        <ProgressBar
          percent={row.original.progressPercent}
          state={row.original.state}
        />
      ),
    },
    {
      id: "rows",
      header: "Rincian Baris",
      size: 180,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground tabular-nums">
              Total {b.totalRows}
            </span>
            {b.successRows > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium tabular-nums">
                • {b.successRows} Berhasil
              </span>
            )}
            {b.failedRows > 0 && (
              <span className="text-rose-600 dark:text-rose-400 font-medium tabular-nums">
                • {b.failedRows} Gagal
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Waktu Unggah",
      size: 150,
      cell: ({ row }) => {
        const d = row.original.createdAt;
        if (!d) return "—";
        return (
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatDateTime(d)}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "",
      size: 100,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(b);
            }}
            className="h-8 gap-1 text-xs text-primary hover:text-primary hover:bg-primary/10"
          >
            <EyeIcon className="size-3.5" />
            Detail & Baris
          </Button>
        );
      },
    },
  ];
}

export function ImportView() {
  const [importType, setImportType] = React.useState<ImportBatchType | null>(
    null,
  );
  const [selectedBatch, setSelectedBatch] = React.useState<ImportBatch | null>(
    null,
  );

  const [typeFilter, setTypeFilter] = React.useState<"all" | ImportBatchType>(
    "all",
  );
  const [stateFilter, setStateFilter] = React.useState<
    "all" | ImportBatchState
  >("all");
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const query = useImportBatches({
    type: typeFilter === "all" ? undefined : typeFilter,
    state: stateFilter === "all" ? undefined : stateFilter,
    page: pagination.pageIndex + 1,
    perPage: pagination.pageSize,
  });

  const items = query.data?.items ?? [];
  const total = query.data?.meta?.total ?? 0;
  const columns = React.useMemo(() => buildColumns(setSelectedBatch), []);

  const hasFilter = typeFilter !== "all" || stateFilter !== "all";

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
            <h2 className="font-semibold">Katalog & Riwayat Import Produk</h2>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" className="h-9 gap-2">
                  <ImportIcon className="size-4" />
                  Import Baru
                  <ChevronDownIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuItem
                  onSelect={() => setImportType("single")}
                  className="flex-col items-start gap-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <PackageIcon className="size-4 text-primary" />
                    Import Produk Satuan
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Validasi & buat produk satuan dari file Excel.
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => setImportType("bundle")}
                  className="flex-col items-start gap-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <LayersIcon className="size-4 text-primary" />
                    Import Produk Bundle
                  </span>
                  <span className="pl-6 text-xs text-muted-foreground">
                    Validasi komponen & buat bundle dari file Excel.
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
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

        <FilterToolbar
          onReset={
            hasFilter
              ? () => {
                  setTypeFilter("all");
                  setStateFilter("all");
                  setPagination((p) => ({ ...p, pageIndex: 0 }));
                }
              : undefined
          }
          hasFilter={hasFilter}
          activeCount={
            (typeFilter !== "all" ? 1 : 0) + (stateFilter !== "all" ? 1 : 0)
          }
        >
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v as "all" | ImportBatchType);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="rounded-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="single">Satuan</SelectItem>
              <SelectItem value="bundle">Bundle</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={stateFilter}
            onValueChange={(v) => {
              setStateFilter(v as "all" | ImportBatchState);
              setPagination((p) => ({ ...p, pageIndex: 0 }));
            }}
          >
            <SelectTrigger className="rounded-full bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="previewing">Validasi File</SelectItem>
              <SelectItem value="previewed">Siap Diterapkan</SelectItem>
              <SelectItem value="processing">Sedang Menerapkan</SelectItem>
              <SelectItem value="done">Selesai</SelectItem>
              <SelectItem value="done_with_errors">
                Selesai (Ada Error)
              </SelectItem>
              <SelectItem value="failed">Gagal</SelectItem>
            </SelectContent>
          </Select>
        </FilterToolbar>

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
                  description="Mulai dengan mengklik Import Baru → pilih Satuan atau Bundle."
                  className="py-6"
                />
              }
            />
          )}
        </div>
      </LiquidGlass>

      {importType && (
        <ImportDialog
          type={importType}
          open={!!importType}
          onOpenChange={(o) => !o && setImportType(null)}
          onQueued={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
        />
      )}

      <ImportRowSheet
        batch={selectedBatch}
        open={!!selectedBatch}
        onOpenChange={(o) => !o && setSelectedBatch(null)}
      />
    </>
  );
}
