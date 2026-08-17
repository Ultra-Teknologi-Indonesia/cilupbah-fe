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
import { ScrollArea } from "@/components/ui/scroll-area";
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
      className="gap-1 border-success/30 bg-success/10 text-success text-xs font-medium"
    >
      <CheckCircle2Icon className="size-3" />
      Siap Dibuat
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 border-destructive/30 bg-destructive/10 text-destructive text-xs font-medium"
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
      // Auto-expand the first 2 documents
      setExpandedDocs({ 0: true, 1: true });
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
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[92vh] flex-col gap-0 p-0 transition-all duration-200",
          preview ? "w-full max-w-5xl" : "w-full max-w-xl",
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
          <div className="flex flex-col gap-4 p-6">
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
                  <FileSpreadsheetIcon className="size-11 text-success" />
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
          <div className="flex flex-col min-h-0 flex-1 p-6 gap-4">
            {/* Stat Summary Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-border/40 bg-muted/20 p-3">
                <p className="text-xs text-muted-foreground">
                  Total Baris Data
                </p>
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {summary?.total_rows ?? 0}
                </p>
              </div>
              <div className="rounded-xl border border-success/30 bg-success/10 p-3">
                <div className="flex items-center gap-1 text-success text-xs font-medium">
                  <CheckCircle2Icon className="size-3.5" />
                  <span>Siap Dibuat</span>
                </div>
                <p className="text-lg font-bold tabular-nums text-success">
                  {summary?.valid_docs ?? 0} PO
                </p>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3">
                <div className="flex items-center gap-1 text-destructive text-xs font-medium">
                  <XCircleIcon className="size-3.5" />
                  <span>Terdapat Error</span>
                </div>
                <p className="text-lg font-bold tabular-nums text-destructive">
                  {summary?.invalid_docs ?? 0} PO
                </p>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning/10 p-3">
                <div className="flex items-center gap-1 text-warning text-xs font-medium">
                  <AlertTriangleIcon className="size-3.5" />
                  <span>Peringatan</span>
                </div>
                <p className="text-lg font-bold tabular-nums text-warning">
                  {summary?.warnings ?? 0}
                </p>
              </div>
            </div>

            {/* Error Banner if any */}
            {preview.errors.length > 0 && (
              <div className="max-h-24 overflow-auto rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <div className="font-semibold mb-0.5">
                  Ditemukan {preview.errors.length} masalah validasi:
                </div>
                {preview.errors.slice(0, 15).map((e, i) => (
                  <div key={i}>• {e.error}</div>
                ))}
                {preview.errors.length > 15 && (
                  <div className="text-muted-foreground mt-0.5">
                    +{preview.errors.length - 15} masalah lainnya...
                  </div>
                )}
              </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setTab("all")}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    tab === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted/40",
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
                      ? "bg-success/15 text-success font-semibold"
                      : "text-muted-foreground hover:bg-muted/40",
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
                      ? "bg-destructive/15 text-destructive font-semibold"
                      : "text-muted-foreground hover:bg-muted/40",
                  )}
                >
                  Error ({summary?.invalid_docs ?? 0})
                </button>
              </div>

              <div className="text-xs text-muted-foreground">
                Menampilkan {filteredDocs.length} dokumen pesanan
              </div>
            </div>

            {/* Document List & Items Breakdown */}
            <ScrollArea className="h-[42vh] rounded-xl border border-border/50 bg-background/50">
              <div className="divide-y divide-border/40 p-3 space-y-3">
                {filteredDocs.map((doc: PurchaseImportDoc, idx: number) => {
                  const isExpanded = expandedDocs[idx] ?? false;

                  return (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-xl border p-3.5 transition-colors",
                        doc.status === "error"
                          ? "border-destructive/30 bg-destructive/[0.02]"
                          : "border-border/60 bg-card/60",
                      )}
                    >
                      {/* Document Header */}
                      <div
                        className="flex cursor-pointer items-center justify-between gap-3"
                        onClick={() => toggleExpand(idx)}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="size-4" />
                            ) : (
                              <ChevronRightIcon className="size-4" />
                            )}
                          </button>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold font-mono text-sm text-foreground">
                                {doc.po_number}
                              </span>
                              <StatusBadge status={doc.status} />
                              {doc.is_tax_included && (
                                <Badge variant="secondary" className="text-2xs">
                                  Termasuk Pajak
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Building2Icon className="size-3 text-muted-foreground/70" />
                                {doc.supplier_name || "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPinIcon className="size-3 text-muted-foreground/70" />
                                {doc.location_name || "—"}
                              </span>
                              <span className="flex items-center gap-1">
                                <CalendarIcon className="size-3 text-muted-foreground/70" />
                                {formatDate(doc.order_date)}
                              </span>
                              <span className="flex items-center gap-1">
                                <LayersIcon className="size-3 text-muted-foreground/70" />
                                {doc.item_count} item
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-sm font-bold tabular-nums text-foreground">
                            {formatCurrency(doc.total_amount)}
                          </div>
                          {doc.total_tax > 0 && (
                            <div className="text-2xs text-muted-foreground">
                              Pajak: {formatCurrency(doc.total_tax)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Error Messages for Doc */}
                      {doc.errors.length > 0 && (
                        <div className="mt-2.5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                          {doc.errors.map((err, errIdx) => (
                            <div key={errIdx}>• {err}</div>
                          ))}
                        </div>
                      )}

                      {/* Item Breakdown Table */}
                      {isExpanded && (
                        <div className="mt-3.5 overflow-hidden rounded-lg border border-border/40 bg-muted/20">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-b border-border/40 bg-muted/40">
                                <TableHead className="h-8 py-1 px-3 text-2xs uppercase tracking-wider text-muted-foreground">
                                  SKU / Produk
                                </TableHead>
                                <TableHead className="h-8 py-1 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground">
                                  Qty
                                </TableHead>
                                <TableHead className="h-8 py-1 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground">
                                  Harga
                                </TableHead>
                                <TableHead className="h-8 py-1 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground">
                                  Diskon
                                </TableHead>
                                <TableHead className="h-8 py-1 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground">
                                  Pajak
                                </TableHead>
                                <TableHead className="h-8 py-1 px-3 text-right text-2xs uppercase tracking-wider text-muted-foreground">
                                  Total
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {doc.items.map((item, itIdx) => (
                                <TableRow
                                  key={itIdx}
                                  className="border-b border-border/20 last:border-0 text-xs"
                                >
                                  <TableCell className="py-2 px-3">
                                    <div className="font-mono font-medium text-foreground">
                                      {item.sku}
                                    </div>
                                    {item.product_name && (
                                      <div className="text-2xs text-muted-foreground truncate max-w-xs">
                                        {item.product_name}
                                      </div>
                                    )}
                                  </TableCell>
                                  <TableCell className="py-2 px-3 text-right font-medium tabular-nums">
                                    {item.qty}
                                  </TableCell>
                                  <TableCell className="py-2 px-3 text-right tabular-nums">
                                    {formatCurrency(item.unit_price)}
                                  </TableCell>
                                  <TableCell className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                                    {item.disc_amount > 0
                                      ? formatCurrency(item.disc_amount)
                                      : "—"}
                                  </TableCell>
                                  <TableCell className="py-2 px-3 text-right tabular-nums text-muted-foreground">
                                    {item.tax_amount > 0
                                      ? formatCurrency(item.tax_amount)
                                      : item.tax_name || "—"}
                                  </TableCell>
                                  <TableCell className="py-2 px-3 text-right font-semibold tabular-nums text-foreground">
                                    {formatCurrency(item.amount)}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-1 border-t border-border/40">
              <Button variant="outline" size="sm" onClick={reset}>
                Ganti File
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
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
