"use client";

import * as React from "react";
import {
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  UploadIcon,
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
  downloadImportSettingTemplate,
  useImportSettingConfirm,
  useImportSettingPreview,
} from "@/hooks/persediaan/use-inventory-settings";
import { apiError } from "@/lib/toast";
import type {
  ImportPreviewResult,
  ImportSettingType,
  RackManualMove,
  RackPreviewRow,
  ThresholdPreviewRow,
} from "@/types/persediaan/inventory-setting";

const ACCEPT = ".csv,.xlsx,.xls";
const MAX_SIZE = 10 * 1024 * 1024;

const TITLES: Record<ImportSettingType, string> = {
  "safe-stock": "Import Batas Stok Aman",
  "min-stock": "Import Batas Stok Menipis",
  "rack-allocation": "Import Alokasi Rak",
};

interface Props {
  type: ImportSettingType | null;
  onOpenChange: (open: boolean) => void;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    update: { label: "Akan diperbarui", className: "text-primary" },
    place: { label: "Akan ditempatkan", className: "text-success" },
    manual_move: { label: "Perlu Pindah Bin", className: "text-warning" },
    already: { label: "Sudah sesuai", className: "text-muted-foreground" },
    error: { label: "Error", className: "text-destructive" },
  };
  const cfg = map[status] ?? { label: status, className: "text-muted-foreground" };
  return (
    <Badge variant="outline" className={cn("shrink-0", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function downloadManualMoves(rows: RackManualMove[]) {
  const header = "SKU,Lokasi,Rak Sekarang,Rak Tujuan";
  const body = rows
    .map(
      (r) =>
        `${r.sku},${r.location_name},${r.current_bin},${r.target_bin}`.replace(
          /\n/g,
          " ",
        ),
    )
    .join("\n");
  const blob = new Blob([`${header}\n${body}`], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `perlu-pindah-bin-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ImportSettingDialog({ type, onOpenChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [preview, setPreview] = React.useState<ImportPreviewResult | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const previewMut = useImportSettingPreview();
  const confirmMut = useImportSettingConfirm();

  const isRack = type === "rack-allocation";

  const handleDownloadTemplate = async () => {
    if (!type) return;
    try {
      setIsDownloading(true);
      await downloadImportSettingTemplate(type);
      toast.success("Template berhasil didownload");
    } catch (err: unknown) {
      apiError(err, "Gagal mendownload template");
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = React.useCallback(() => {
    setFile(null);
    setPreview(null);
    setDragOver(false);
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
    if (!file || !type) return;
    const result = await previewMut.mutateAsync({ type, file });
    setPreview(result);
  };

  const runConfirm = async () => {
    if (!preview || !type) return;
    const res = await confirmMut.mutateAsync({ type, token: preview.token });
    toast.success(
      isRack
        ? `${res.applied} SKU ditempatkan${res.manual_moves ? `, ${res.manual_moves} perlu Pindah Bin manual` : ""}.`
        : `${res.applied} produk diperbarui.`,
    );
    reset();
    onOpenChange(false);
  };

  const summary = preview?.summary ?? {};
  const actionable = isRack
    ? (summary.place ?? 0) > 0
    : (summary.valid ?? 0) > 0;
  const manualMoves = preview?.manual_moves ?? [];

  return (
    <Dialog
      open={!!type}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{type ? TITLES[type] : ""}</DialogTitle>
          <DialogDescription>
            Unduh template, isi data, simpan sebagai CSV, lalu unggah untuk
            pratinjau sebelum diterapkan.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div className="flex flex-col gap-4">
            {type && (
              <button
                type="button"
                disabled={isDownloading}
                onClick={handleDownloadTemplate}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-left text-sm transition-colors hover:bg-primary/10 disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2Icon className="size-5 shrink-0 animate-spin text-primary" />
                ) : (
                  <DownloadIcon className="size-5 shrink-0 text-primary" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-primary">
                    {isDownloading ? "Mengunduh Template..." : "Unduh Template"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    template-import-{type}.xlsx
                  </div>
                </div>
              </button>
            )}

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
                "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors",
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40 hover:bg-muted/30",
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
                  <FileSpreadsheetIcon className="size-10 text-success" />
                  <div className="font-medium">{file.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </div>
                </>
              ) : (
                <>
                  <UploadIcon className="size-8 text-muted-foreground" />
                  <div className="text-sm font-medium">
                    Drag &amp; drop file atau klik untuk pilih
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Format: .csv, .xlsx — Maks 10 MB
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button
                variant="primary"
                disabled={!file || previewMut.isPending}
                onClick={runPreview}
              >
                {previewMut.isPending && (
                  <Loader2Icon className="size-4 animate-spin" />
                )}
                Pratinjau
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Total baris:</span>
              <Badge variant="secondary">{summary.total_rows ?? 0}</Badge>
              {isRack ? (
                <>
                  <Badge variant="outline" className="text-success">
                    {summary.place ?? 0} ditempatkan
                  </Badge>
                  <Badge variant="outline" className="text-warning">
                    {summary.manual_move ?? 0} Pindah Bin
                  </Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    {summary.already ?? 0} sudah sesuai
                  </Badge>
                  <Badge variant="outline" className="text-destructive">
                    {summary.error ?? 0} error
                  </Badge>
                </>
              ) : (
                <>
                  <Badge variant="outline" className="text-success">
                    {summary.valid ?? 0} valid
                  </Badge>
                  <Badge variant="outline" className="text-destructive">
                    {summary.error ?? 0} error
                  </Badge>
                </>
              )}
              {isRack && manualMoves.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto gap-1.5"
                  onClick={() => downloadManualMoves(manualMoves)}
                >
                  <DownloadIcon className="size-4" />
                  Unduh daftar Pindah Bin
                </Button>
              )}
            </div>

            <div className="max-h-[50vh] overflow-auto rounded-2xl border border-border">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/40">
                    <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      SKU
                    </TableHead>
                    {isRack ? (
                      <>
                        <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                          Lokasi
                        </TableHead>
                        <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                          Rak
                        </TableHead>
                      </>
                    ) : (
                      <>
                        <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
                          Saat ini
                        </TableHead>
                        <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
                          Baru
                        </TableHead>
                      </>
                    )}
                    <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Keterangan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.items.map((row, i) =>
                    isRack ? (
                      (() => {
                        const r = row as RackPreviewRow;
                        return (
                          <TableRow
                            key={i}
                            className="border-b border-border/40 last:border-0"
                          >
                            <TableCell className="px-3 py-2 font-mono text-xs">
                              {r.sku}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm">
                              {r.location_name}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-sm">
                              {r.bin_final_code}
                            </TableCell>
                            <TableCell className="px-3 py-2">
                              <StatusPill status={r.status} />
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                              {r.message}
                            </TableCell>
                          </TableRow>
                        );
                      })()
                    ) : (
                      (() => {
                        const r = row as ThresholdPreviewRow;
                        return (
                          <TableRow
                            key={i}
                            className="border-b border-border/40 last:border-0"
                          >
                            <TableCell className="px-3 py-2 font-mono text-xs">
                              {r.sku}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-right tabular-nums">
                              {r.current ?? "—"}
                            </TableCell>
                            <TableCell className="px-3 py-2 text-right font-semibold tabular-nums">
                              {r.new ?? "—"}
                            </TableCell>
                            <TableCell className="px-3 py-2">
                              <StatusPill status={r.status} />
                            </TableCell>
                            <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                              {r.message}
                            </TableCell>
                          </TableRow>
                        );
                      })()
                    ),
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={reset}>
                Ganti File
              </Button>
              <Button
                variant="primary"
                disabled={!actionable || confirmMut.isPending}
                onClick={runConfirm}
              >
                {confirmMut.isPending && (
                  <Loader2Icon className="size-4 animate-spin" />
                )}
                Terapkan
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
