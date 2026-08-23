"use client";

import * as React from "react";
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  UploadIcon,
  CheckCircle2Icon,
  XCircleIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Building2Icon,
  MapPinIcon,
  CalendarIcon,
  LayersIcon,
  FileTextIcon,
  TagIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  downloadPurchaseOrderTemplate,
  useImportPurchaseOrderPreview,
  useImportPurchaseOrderConfirm,
} from "@/hooks/transaksi-pembelian/use-purchase-order-import-export";
import { apiError } from "@/lib/toast";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  PurchaseImportPreview,
  PurchaseImportDoc,
} from "@/types/transaksi-pembelian/purchase-order-import";

const ACCEPT = ".xlsx,.xls,.csv";
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FilterTab = "all" | "valid" | "invalid";

function StatusBadge({ status }: { status: "ready" | "error" }) {
  return status === "ready" ? (
    <Badge
      variant="outline"
      className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold shrink-0"
    >
      <CheckCircle2Icon className="size-3" />
      Siap Dibuat
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-xs font-semibold shrink-0"
    >
      <XCircleIcon className="size-3" />
      Terdapat Error
    </Badge>
  );
}

export function ImportPesananDialog({ open, onOpenChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [preview, setPreview] = React.useState<PurchaseImportPreview | null>(
    null,
  );
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [tab, setTab] = React.useState<FilterTab>("all");
  const [expandedDocs, setExpandedDocs] = React.useState<
    Record<number, boolean>
  >({});

  const previewMut = useImportPurchaseOrderPreview();
  const confirmMut = useImportPurchaseOrderConfirm();

  const handleDownloadTemplate = async () => {
    try {
      setIsDownloading(true);
      await downloadPurchaseOrderTemplate();
      toast.success("Template import berhasil didownload");
    } catch (err: unknown) {
      apiError(err, "Gagal mendownload template import");
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = React.useCallback(() => {
    setFile(null);
    setPreview(null);
    setDragOver(false);
    setTab("all");
    setExpandedDocs({});
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      toast.error("File terlalu besar. Maksimal 10 MB.");
      return;
    }
    setFile(f);
    setPreview(null);
  };

  const runPreview = async () => {
    if (!file) return;
    try {
      const result = await previewMut.mutateAsync(file);
      setPreview(result);
      setTab(result.summary.invalid_docs > 0 ? "invalid" : "all");
      // Auto-expand all documents initially for clear inspection
      const initialExpanded: Record<number, boolean> = {};
      result.documents.forEach((_, idx) => {
        initialExpanded[idx] = true;
      });
      setExpandedDocs(initialExpanded);
    } catch (err: unknown) {
      apiError(err, "Gagal memproses pratinjau file import");
    }
  };

  const runConfirm = async () => {
    if (!preview) return;
    try {
      const res = await confirmMut.mutateAsync({
        token: preview.token,
      });

      if (res.failed > 0) {
        toast.warning(
          `${res.created} pesanan dibuat, ${res.failed} gagal disimpan.`,
        );
      } else {
        toast.success(`Berhasil mengimpor ${res.created} pesanan pembelian.`);
      }
      reset();
      onOpenChange(false);
    } catch (err: unknown) {
      apiError(err, "Gagal menyimpan data import pesanan");
    }
  };

  const summary = preview?.summary;

  const toggleExpand = (idx: number) => {
    setExpandedDocs((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const filteredDocs = React.useMemo(() => {
    if (!preview) return [];
    if (tab === "valid")
      return preview.documents.filter((d) => d.status === "ready");
    if (tab === "invalid")
      return preview.documents.filter((d) => d.status === "error");
    return preview.documents;
  }, [preview, tab]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (confirmMut.isPending || previewMut.isPending) return;
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent
        className={cn(
          "!flex !flex-col !gap-0 !p-0 transition-all duration-200 overflow-hidden",
          preview
            ? "w-full max-w-[96vw] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl h-[90vh] max-h-[90vh]"
            : "w-full max-w-xl sm:max-w-xl h-auto max-h-[90vh]",
        )}
      >
        <DialogHeader className="shrink-0 border-b border-border/40 px-6 py-4">
          <DialogTitle className="text-base font-semibold">
            Import Pesanan Pembelian
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {preview
              ? "Periksa kelengkapan data sebelum konfirmasi pembuatan pesanan pembelian."
              : "Unduh template resmi, lengkapi data pembelian, lalu unggah untuk melihat pratinjau data."}
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          // STEP 1: Upload & Instructions
          <div className="flex flex-col gap-4 p-6 overflow-y-auto">
            <button
              type="button"
              disabled={isDownloading}
              onClick={handleDownloadTemplate}
              className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3.5 text-left text-sm transition-colors hover:bg-primary/10 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2Icon className="size-5 shrink-0 animate-spin text-primary" />
              ) : (
                <DownloadIcon className="size-5 shrink-0 text-primary" />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-primary">
                  {isDownloading
                    ? "Mengunduh Template..."
                    : "Unduh Template Import Excel"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Format .xlsx lengkap dengan panduan dan master data aktif
                </div>
              </div>
            </button>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files[0]);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/20",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {file ? (
                <>
                  <FileSpreadsheetIcon className="size-11 text-emerald-600 dark:text-emerald-400" />
                  <div className="font-medium text-sm text-foreground">
                    {file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB — Klik untuk mengganti
                    file
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UploadIcon className="size-6" />
                  </div>
                  <div className="text-sm font-medium text-foreground">
                    Drag &amp; drop file Excel/CSV di sini, atau klik untuk
                    memilih
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Format yang didukung: .xlsx, .xls, .csv (Maksimal 10 MB)
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-border/40 bg-muted/20 p-3.5 text-xs text-muted-foreground">
              <div className="font-medium text-foreground mb-1">
                Catatan Penting:
              </div>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  Satu pesanan pembelian bisa memiliki banyak baris item produk.
                </li>
                <li>
                  Gunakan nomor pesanan yang sama atau kosongkan header pada
                  baris item berikutnya untuk menggabungkan ke 1 PO.
                </li>
                <li>
                  Isi <code>[auto]</code> pada No. Pesanan bila ingin nomor PO
                  di-generate otomatis oleh sistem.
                </li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                disabled={!file || previewMut.isPending}
                onClick={runPreview}
              >
                {previewMut.isPending && (
                  <Loader2Icon className="size-4 animate-spin mr-1.5" />
                )}
                Lihat Pratinjau
              </Button>
            </div>
          </div>
        ) : (
          // STEP 2: Preview & Confirmation
          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* Top Fixed Section: Cards + Errors + Filter */}
            <div className="shrink-0 p-6 pb-3 space-y-3.5 border-b border-border/40 bg-muted/10">
              {/* Stat Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* 1. Total Baris */}
                <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 flex flex-col justify-between">
                  <p className="text-xs font-medium text-muted-foreground">
                    Total Baris Data
                  </p>
                  <p className="text-2xl font-bold tabular-nums text-foreground mt-1">
                    {summary?.total_rows ?? 0}
                  </p>
                </div>

                {/* 2. Siap Dibuat */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    <CheckCircle2Icon className="size-3.5" />
                    <span>Siap Dibuat</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-400 mt-1">
                    {summary?.valid_docs ?? 0}{" "}
                    <span className="text-xs font-medium text-emerald-600/80 dark:text-emerald-400/80">
                      PO
                    </span>
                  </p>
                </div>

                {/* 3. Terdapat Error */}
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 text-xs font-semibold">
                    <XCircleIcon className="size-3.5" />
                    <span>Terdapat Error</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-rose-700 dark:text-rose-400 mt-1">
                    {summary?.invalid_docs ?? 0}{" "}
                    <span className="text-xs font-medium text-rose-600/80 dark:text-rose-400/80">
                      PO
                    </span>
                  </p>
                </div>

                {/* 4. Peringatan */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 p-3.5 flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 text-xs font-semibold">
                    <AlertTriangleIcon className="size-3.5" />
                    <span>Peringatan</span>
                  </div>
                  <p className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-400 mt-1">
                    {summary?.warnings ?? 0}
                  </p>
                </div>
              </div>

              {/* Error Banner if any */}
              {preview.errors.length > 0 && (
                <div className="max-h-24 overflow-y-auto rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20 px-3.5 py-2 text-xs text-rose-700 dark:text-rose-400">
                  <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                    <AlertTriangleIcon className="size-3.5 shrink-0" />
                    <span>
                      Ditemukan {preview.errors.length} masalah validasi:
                    </span>
                  </div>
                  <div className="space-y-0.5 pl-5">
                    {preview.errors.map((e, i) => {
                      const text =
                        e.row && !e.error.startsWith(`Baris ${e.row}:`)
                          ? `Baris ${e.row}: ${e.error}`
                          : e.error;
                      return <div key={i}>• {text}</div>;
                    })}
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTab("all")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      tab === "all"
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60",
                    )}
                  >
                    Semua ({summary?.total_docs ?? 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("valid")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      tab === "valid"
                        ? "bg-emerald-600 text-white font-semibold shadow-sm"
                        : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10",
                    )}
                  >
                    Valid ({summary?.valid_docs ?? 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("invalid")}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                      tab === "invalid"
                        ? "bg-rose-600 text-white font-semibold shadow-sm"
                        : "text-rose-700 dark:text-rose-400 hover:bg-rose-500/10",
                    )}
                  >
                    Error ({summary?.invalid_docs ?? 0})
                  </button>
                </div>

                <div className="text-xs text-muted-foreground">
                  Menampilkan {filteredDocs.length} dari{" "}
                  {summary?.total_docs ?? 0} dokumen pesanan
                </div>
              </div>
            </div>

            {/* Middle Scrollable Section: Document List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-3.5 bg-background">
              {filteredDocs.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  Tidak ada dokumen pesanan yang sesuai dengan filter.
                </div>
              ) : (
                filteredDocs.map((doc: PurchaseImportDoc, idx: number) => {
                  const isExpanded = expandedDocs[idx] ?? true;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-xl border p-4 transition-colors",
                        doc.status === "error"
                          ? "border-rose-500/30 bg-rose-500/[0.03]"
                          : "border-border/60 bg-card/60",
                      )}
                    >
                      {/* Document Header */}
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                        onClick={() => toggleExpand(idx)}
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="size-4" />
                            ) : (
                              <ChevronRightIcon className="size-4" />
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold font-mono text-sm text-foreground">
                                {doc.po_number || "(Otomatis)"}
                              </span>
                              <StatusBadge status={doc.status} />
                              {doc.ref_no && (
                                <Badge
                                  variant="outline"
                                  className="text-2xs font-mono gap-1 text-muted-foreground"
                                >
                                  <TagIcon className="size-2.5" />
                                  {doc.ref_no}
                                </Badge>
                              )}
                              {doc.is_tax_included && (
                                <Badge variant="secondary" className="text-2xs">
                                  Termasuk Pajak
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1.5 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1.5">
                                <Building2Icon className="size-3 text-muted-foreground/70 shrink-0" />
                                <span className="font-medium text-foreground/80">
                                  {doc.supplier_name || "—"}
                                </span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPinIcon className="size-3 text-muted-foreground/70 shrink-0" />
                                <span>{doc.location_name || "—"}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <CalendarIcon className="size-3 text-muted-foreground/70 shrink-0" />
                                <span>{formatDate(doc.order_date)}</span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <LayersIcon className="size-3 text-muted-foreground/70 shrink-0" />
                                <span>
                                  {doc.item_count} item (
                                  {doc.items.reduce(
                                    (acc, it) => acc + (it.qty || 0),
                                    0,
                                  )}{" "}
                                  qty)
                                </span>
                              </span>
                              {doc.notes && (
                                <span className="flex items-center gap-1.5 italic text-muted-foreground">
                                  <FileTextIcon className="size-3 text-muted-foreground/70 shrink-0" />
                                  <span>{doc.notes}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 pl-7 sm:pl-0">
                          <div className="text-xs text-muted-foreground">
                            Total Pesanan
                          </div>
                          <div className="text-base font-bold tabular-nums text-foreground">
                            {formatCurrency(doc.total_amount)}
                          </div>
                          {(doc.total_disc > 0 || doc.total_tax > 0) && (
                            <div className="text-2xs text-muted-foreground flex items-center sm:justify-end gap-2 mt-0.5">
                              {doc.total_disc > 0 && (
                                <span>
                                  Diskon: -{formatCurrency(doc.total_disc)}
                                </span>
                              )}
                              {doc.total_tax > 0 && (
                                <span>
                                  Pajak: +{formatCurrency(doc.total_tax)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error Messages for Doc */}
                      {doc.errors.length > 0 && (
                        <div className="mt-3 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs text-rose-700 dark:text-rose-400">
                          <div className="font-semibold mb-0.5">
                            Kendala pada dokumen ini:
                          </div>
                          <div className="space-y-0.5">
                            {doc.errors.map((err, errIdx) => (
                              <div key={errIdx}>• {err}</div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Item Breakdown Table */}
                      {isExpanded && (
                        <div className="mt-3.5 overflow-hidden rounded-lg border border-border/40 bg-muted/20">
                          <div className="overflow-x-auto">
                            <Table className="min-w-[700px]">
                              <TableHeader>
                                <TableRow className="border-b border-border/40 bg-muted/40">
                                  <TableHead className="h-8 py-1.5 px-3 text-2xs uppercase tracking-wider text-muted-foreground w-12 text-center">
                                    #
                                  </TableHead>
                                  <TableHead className="h-8 py-1.5 px-3 text-2xs uppercase tracking-wider text-muted-foreground min-w-[220px]">
                                    SKU / Produk
                                  </TableHead>
                                  <TableHead className="h-8 py-1.5 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground w-20">
                                    Qty
                                  </TableHead>
                                  <TableHead className="h-8 py-1.5 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground min-w-[110px]">
                                    Harga Satuan
                                  </TableHead>
                                  <TableHead className="h-8 py-1.5 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground min-w-[90px]">
                                    Diskon
                                  </TableHead>
                                  <TableHead className="h-8 py-1.5 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground min-w-[90px]">
                                    Pajak
                                  </TableHead>
                                  <TableHead className="h-8 py-1.5 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground min-w-[120px]">
                                    Total
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {doc.items.map((item, itIdx) => (
                                  <TableRow
                                    key={itIdx}
                                    className="border-b border-border/20 last:border-0 text-xs hover:bg-muted/30"
                                  >
                                    <TableCell className="py-2.5 px-3 text-center text-muted-foreground font-mono text-2xs">
                                      {item.row_no || itIdx + 1}
                                    </TableCell>
                                    <TableCell className="py-2.5 px-3">
                                      <div className="font-mono font-medium text-foreground">
                                        {item.sku}
                                      </div>
                                      {item.product_name && (
                                        <div className="text-2xs text-muted-foreground line-clamp-2 mt-0.5 max-w-md">
                                          {item.product_name}
                                        </div>
                                      )}
                                    </TableCell>
                                    <TableCell className="py-2.5 px-3 text-right font-medium tabular-nums text-foreground">
                                      {item.qty}
                                    </TableCell>
                                    <TableCell className="py-2.5 px-3 text-right tabular-nums">
                                      {formatCurrency(item.unit_price)}
                                    </TableCell>
                                    <TableCell className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                                      {item.disc_amount > 0 ? (
                                        <span className="text-foreground">
                                          {formatCurrency(item.disc_amount)}
                                          {item.disc > 0 && item.disc < 1 && (
                                            <span className="text-2xs text-muted-foreground block">
                                              ({(item.disc * 100).toFixed(0)}%)
                                            </span>
                                          )}
                                        </span>
                                      ) : (
                                        "—"
                                      )}
                                    </TableCell>
                                    <TableCell className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">
                                      {item.tax_amount > 0 ? (
                                        <span className="text-foreground">
                                          {formatCurrency(item.tax_amount)}
                                          <span className="text-2xs text-muted-foreground block">
                                            {item.tax_name || "Pajak"}
                                          </span>
                                        </span>
                                      ) : (
                                        item.tax_name || "—"
                                      )}
                                    </TableCell>
                                    <TableCell className="py-2.5 px-3 text-right font-semibold tabular-nums text-foreground">
                                      {formatCurrency(item.amount)}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Actions Fixed Pin */}
            <div className="flex items-center justify-between px-6 py-3.5 border-t border-border/40 bg-muted/10 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={confirmMut.isPending}
                onClick={reset}
              >
                Ganti File
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={confirmMut.isPending}
                  onClick={() => onOpenChange(false)}
                >
                  Batal
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={
                    (summary?.valid_docs ?? 0) === 0 || confirmMut.isPending
                  }
                  onClick={runConfirm}
                >
                  {confirmMut.isPending && (
                    <Loader2Icon className="size-4 animate-spin mr-1.5" />
                  )}
                  Terapkan ({summary?.valid_docs ?? 0} Pesanan)
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
