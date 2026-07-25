"use client";

import * as React from "react";
import {
  ArrowRightIcon,
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
  importTransferTemplateUrl,
  useImportTransferConfirm,
  useImportTransferPreview,
} from "@/hooks/barang-keluar/use-outbound-transfers";
import type { TransferImportPreview } from "@/types/barang-keluar/transfer-import";

const ACCEPT = ".xlsx,.xls";
const MAX_SIZE = 5 * 1024 * 1024;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  createdBy: string;
}

function StatusPill({ status }: { status: "ready" | "error" }) {
  return status === "ready" ? (
    <Badge variant="outline" className="shrink-0 text-success">
      Siap dibuat
    </Badge>
  ) : (
    <Badge variant="outline" className="shrink-0 text-destructive">
      Error
    </Badge>
  );
}

export function ImportTransferDialog({ open, onOpenChange, createdBy }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [preview, setPreview] = React.useState<TransferImportPreview | null>(
    null,
  );

  const previewMut = useImportTransferPreview();
  const confirmMut = useImportTransferConfirm();

  const reset = React.useCallback(() => {
    setFile(null);
    setPreview(null);
    setDragOver(false);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      toast.error("File terlalu besar. Maksimal 5 MB.");
      return;
    }
    setFile(f);
    setPreview(null);
  };

  const runPreview = async () => {
    if (!file) return;
    const result = await previewMut.mutateAsync(file);
    setPreview(result);
  };

  const runConfirm = async () => {
    if (!preview) return;
    if (!createdBy) {
      toast.error("Sesi pengguna tidak ditemukan. Muat ulang halaman.");
      return;
    }
    const res = await confirmMut.mutateAsync({
      token: preview.token,
      createdBy,
    });
    if (res.failed > 0) {
      toast.warning(
        `${res.created} transfer dibuat, ${res.failed} gagal.`,
      );
    } else {
      toast.success(`Berhasil membuat ${res.created} transfer keluar.`);
    }
    reset();
    onOpenChange(false);
  };

  const summary = preview?.summary;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Transfer Keluar</DialogTitle>
          <DialogDescription>
            Unduh template, isi data, simpan sebagai Excel, lalu unggah untuk
            pratinjau sebelum dokumen dibuat.
          </DialogDescription>
        </DialogHeader>

        {!preview ? (
          <div className="flex flex-col gap-4">
            <a
              href={importTransferTemplateUrl()}
              download
              className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
            >
              <DownloadIcon className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-primary">Unduh Template</div>
                <div className="text-xs text-muted-foreground">
                  template-import-transfer-keluar.xlsx
                </div>
              </div>
            </a>

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
                    Format: .xlsx, .xls — Maks 5 MB
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
              <Badge variant="secondary">{summary?.total_rows ?? 0}</Badge>
              <Badge variant="outline" className="text-success">
                {summary?.valid_docs ?? 0} dokumen siap
              </Badge>
              <Badge variant="outline" className="text-destructive">
                {summary?.errors ?? 0} error
              </Badge>
              {(summary?.warnings ?? 0) > 0 && (
                <Badge variant="outline" className="text-warning">
                  {summary?.warnings ?? 0} peringatan
                </Badge>
              )}
            </div>

            {preview.errors.length > 0 && (
              <div className="max-h-28 overflow-auto rounded-2xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                {preview.errors.slice(0, 30).map((e, i) => (
                  <div key={i}>{e.error}</div>
                ))}
                {preview.errors.length > 30 && (
                  <div className="text-muted-foreground">
                    +{preview.errors.length - 30} error lainnya…
                  </div>
                )}
              </div>
            )}

            <div className="max-h-[45vh] overflow-auto rounded-2xl border border-border">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/40">
                    <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      No Transfer
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Asal → Tujuan
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
                      Item
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                      Keterangan
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.transfers.map((doc, i) => (
                    <TableRow
                      key={i}
                      className="border-b border-border/40 align-top last:border-0"
                    >
                      <TableCell className="px-3 py-2 font-mono text-xs">
                        {doc.ref_no}
                      </TableCell>
                      <TableCell className="px-3 py-2 text-sm">
                        <span className="inline-flex items-center gap-1">
                          {doc.source_location || "—"}
                          <ArrowRightIcon className="size-3 text-muted-foreground" />
                          {doc.destination_location || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2 text-right tabular-nums">
                        {doc.item_count}
                      </TableCell>
                      <TableCell className="px-3 py-2">
                        <StatusPill status={doc.status} />
                      </TableCell>
                      <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                        {doc.status === "error"
                          ? doc.errors.join(" ")
                          : doc.items
                              .map((it) => `${it.sku}×${it.qty}`)
                              .join(", ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={reset}>
                Ganti File
              </Button>
              <Button
                variant="primary"
                disabled={(summary?.valid_docs ?? 0) === 0 || confirmMut.isPending}
                onClick={runConfirm}
              >
                {confirmMut.isPending && (
                  <Loader2Icon className="size-4 animate-spin" />
                )}
                Terapkan{" "}
                {(summary?.valid_docs ?? 0) > 0
                  ? `(${summary?.valid_docs} dokumen)`
                  : ""}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
