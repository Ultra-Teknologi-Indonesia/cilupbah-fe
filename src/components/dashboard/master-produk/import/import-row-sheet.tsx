"use client";

import * as React from "react";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ClockIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  SearchIcon,
  XCircleIcon,
} from "lucide-react";
import { formatDateTime, formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadImportErrors,
  useImportBatch,
  useImportBatchRows,
  type ImportBatch,
  type ImportBatchRow,
  type ImportRowStatus,
} from "@/hooks/master-produk/use-import";

interface Props {
  batch: ImportBatch | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function rowStatusBadge(status: ImportRowStatus) {
  switch (status) {
    case "valid":
      return (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2Icon className="mr-1 size-3" />
          Valid
        </Badge>
      );
    case "success":
      return (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2Icon className="mr-1 size-3" />
          Selesai
        </Badge>
      );
    case "invalid":
    case "failed":
      return (
        <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <XCircleIcon className="mr-1 size-3" />
          Gagal
        </Badge>
      );
  }
}

export function ImportRowSheet({ batch: initialBatch, open, onOpenChange }: Props) {
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [search, setSearch] = React.useState<string>("");
  const [page, setPage] = React.useState<number>(1);
  const [isDownloading, setIsDownloading] = React.useState<boolean>(false);

  const batchId = initialBatch?.id ?? null;
  const { data: batchData } = useImportBatch(batchId);
  const batch = batchData ?? initialBatch;

  const { data: rowsData, isLoading: rowsLoading } = useImportBatchRows(batchId, {
    page,
    perPage: 20,
    status: statusFilter === "all" ? undefined : statusFilter,
    search: search.trim() || undefined,
  });

  const rows = rowsData?.items ?? [];
  const meta = rowsData?.meta;

  const handleDownloadErrors = async () => {
    if (!batch) return;
    try {
      setIsDownloading(true);
      await downloadImportErrors(batch.id, batch.batchNo);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-4xl overflow-y-auto p-0 flex flex-col">
        <div className="p-6 border-b border-border/60">
          <SheetHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheetIcon className="size-5 text-primary" />
                <SheetTitle className="text-lg font-semibold">
                  Detail Batch: {batch?.batchNo}
                </SheetTitle>
              </div>
              {batch && batch.failedRows > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isDownloading}
                  onClick={handleDownloadErrors}
                  className="h-8 gap-1.5 text-xs"
                >
                  {isDownloading ? (
                    <Loader2Icon className="size-3.5 animate-spin" />
                  ) : (
                    <DownloadIcon className="size-3.5" />
                  )}
                  Unduh File Error (.xlsx)
                </Button>
              )}
            </div>
            <SheetDescription className="text-xs">
              File: <span className="font-medium text-foreground">{batch?.originalFilename}</span> • Dibuat:{" "}
              {batch?.createdAt ? formatDateTime(batch.createdAt) : "-"} • Tipe:{" "}
              <span className="font-medium text-foreground">
                {batch?.type === "single" ? "Produk Satuan" : "Produk Bundle"}
              </span>
            </SheetDescription>
          </SheetHeader>

          {/* Progress & KPI Summary */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
              <div className="text-xs text-muted-foreground">Total Baris</div>
              <div className="text-lg font-semibold tabular-nums mt-0.5">
                {batch?.totalRows ?? 0}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                Berhasil / Valid
              </div>
              <div className="text-lg font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums mt-0.5">
                {batch?.successRows ?? 0}
              </div>
            </div>
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Sedang Diproses
              </div>
              <div className="text-lg font-semibold text-blue-600 dark:text-blue-400 tabular-nums mt-0.5">
                {batch?.processedRows ?? 0}
              </div>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <div className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                Gagal / Error
              </div>
              <div className="text-lg font-semibold text-rose-600 dark:text-rose-400 tabular-nums mt-0.5">
                {batch?.failedRows ?? 0}
              </div>
            </div>
          </div>

          {/* Real-time Progress Bar */}
          {batch && ["previewing", "confirming", "processing"].includes(batch.state) && (
            <div className="mt-3.5 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-medium text-primary">
                  <Loader2Icon className="size-3 animate-spin" />
                  {batch.state === "previewing"
                    ? "Menganalisis pratinjau data..."
                    : "Menerapkan import ke database..."}
                </span>
                <span className="tabular-nums font-semibold">{batch.progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(5, batch.progressPercent))}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Filters Toolbar */}
        <div className="p-4 bg-muted/20 border-b border-border/60 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-muted p-1 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setStatusFilter("all");
                setPage(1);
              }}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-lg transition-all",
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Semua ({batch?.totalRows ?? 0})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("valid");
                setPage(1);
              }}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-lg transition-all",
                statusFilter === "valid"
                  ? "bg-background text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Valid / Berhasil ({batch?.successRows ?? 0})
            </button>
            <button
              type="button"
              onClick={() => {
                setStatusFilter("invalid");
                setPage(1);
              }}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-lg transition-all",
                statusFilter === "invalid"
                  ? "bg-background text-rose-600 dark:text-rose-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Gagal ({batch?.failedRows ?? 0})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari SKU, Nama, atau Error..."
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>
        </div>

        {/* Rows Table */}
        <div className="flex-1 overflow-auto">
          {rowsLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-2">
              <Loader2Icon className="size-6 animate-spin text-primary" />
              <p className="text-xs">Memuat daftar baris...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground gap-1.5">
              <AlertTriangleIcon className="size-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">Tidak ada baris yang sesuai</p>
              <p className="text-xs">Ubah filter status atau kata kunci pencarian Anda.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur">
                <TableRow>
                  <TableHead className="w-14 text-center text-xs">Baris</TableHead>
                  <TableHead className="w-40 text-xs">SKU</TableHead>
                  <TableHead className="text-xs">Nama Produk / Bundle</TableHead>
                  <TableHead className="w-32 text-xs">Kategori</TableHead>
                  <TableHead className="w-28 text-right text-xs">Harga</TableHead>
                  <TableHead className="w-24 text-center text-xs">Status</TableHead>
                  <TableHead className="w-60 text-xs">Catatan / Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className={cn(
                      "text-xs transition-colors",
                      row.status === "invalid" || row.status === "failed"
                        ? "bg-rose-500/[0.03] hover:bg-rose-500/[0.08]"
                        : "hover:bg-muted/50",
                    )}
                  >
                    <TableCell className="text-center font-mono text-muted-foreground">
                      {row.rowNumber}
                    </TableCell>
                    <TableCell className="font-mono font-medium text-foreground">
                      {row.sku || "-"}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {row.name || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.categoryName || "-"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {row.sellPrice !== null && row.sellPrice !== undefined
                        ? formatCurrency(row.sellPrice)
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {rowStatusBadge(row.status)}
                    </TableCell>
                    <TableCell>
                      {row.message ? (
                        <span className="text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
                          {row.message}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination Footer */}
        {meta && meta.last_page > 1 && (
          <div className="p-3 border-t border-border/60 bg-muted/20 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Halaman {meta.current_page} dari {meta.last_page} ({meta.total} baris)
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="h-7 px-2.5 text-xs"
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.last_page}
                onClick={() => setPage((p) => p + 1)}
                className="h-7 px-2.5 text-xs"
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
