"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileSpreadsheetIcon,
  Loader2Icon,
  TriangleAlertIcon,
  UploadIcon,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  rackImportErrorsDownloadUrl,
  rackImportTemplateUrl,
  useConfirmRackImport,
  useRackImportBatch,
  useRackImportRows,
  useUploadRackImport,
} from "@/hooks/persediaan/use-rack-import";
import type {
  RackImportBatch,
  RackImportRow,
  RackImportRowStatus,
} from "@/hooks/persediaan/use-rack-import";

const ACCEPT = ".csv,.xlsx,.xls";
const MAX_SIZE = 20 * 1024 * 1024;
const PREVIEW_SAMPLE = 50;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROW_STATUS: Record<
  RackImportRowStatus,
  { label: string; className: string }
> = {
  place: { label: "Akan ditempatkan", className: "text-success" },
  placed: { label: "Ditempatkan", className: "text-success" },
  manual_move: { label: "Perlu Pindah Bin", className: "text-warning" },
  already: { label: "Sudah sesuai", className: "text-muted-foreground" },
  error: { label: "Gagal", className: "text-destructive" },
};

function RowStatusPill({ status }: { status: RackImportRowStatus }) {
  const cfg = ROW_STATUS[status] ?? {
    label: status,
    className: "text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn("shrink-0", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

export function RackImportDialog({ open, onOpenChange }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [batchId, setBatchId] = React.useState<string | null>(null);

  const uploadMut = useUploadRackImport();
  const confirmMut = useConfirmRackImport();
  const { data: batch } = useRackImportBatch(batchId);

  const isPreviewed = batch?.state === "previewed";
  const { data: rows } = useRackImportRows(isPreviewed ? batchId : null, {
    perPage: PREVIEW_SAMPLE,
  });

  const reset = React.useCallback(() => {
    setFile(null);
    setDragOver(false);
    setBatchId(null);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    if (f.size > MAX_SIZE) {
      toast.error("File terlalu besar. Maksimal 20 MB.");
      return;
    }
    setFile(f);
  };

  const startPreview = async () => {
    if (!file) return;
    const created = await uploadMut.mutateAsync(file);
    setBatchId(created.id);
  };

  const applyPreview = async () => {
    if (!batchId) return;
    await confirmMut.mutateAsync(batchId);
  };

  const state = batch?.state;
  const analyzing = state === "queued" || state === "previewing";
  const confirming = state === "confirming";
  const finished =
    state === "done" || state === "done_with_errors" || state === "failed";

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
          <DialogTitle>Import Alokasi Rak</DialogTitle>
          <DialogDescription>
            Unggah file (tanpa batas jumlah baris). Sistem memvalidasi tiap baris
            di latar belakang, lalu Anda tinjau sebelum diterapkan.
          </DialogDescription>
        </DialogHeader>

        {!batchId ? (
          <UploadStep
            file={file}
            dragOver={dragOver}
            inputRef={inputRef}
            pending={uploadMut.isPending}
            onDragOver={setDragOver}
            onFile={handleFile}
            onCancel={() => onOpenChange(false)}
            onStart={startPreview}
          />
        ) : analyzing ? (
          <ProgressStep
            title="Menganalisis file…"
            subtitle="Memvalidasi tiap baris terhadap SKU, lokasi, dan aturan rak."
          />
        ) : confirming ? (
          <ProgressStep
            title="Menempatkan ke rak…"
            subtitle={`${batch?.processedRows ?? 0} dari ${batch?.placeRows ?? 0} SKU diproses.`}
            percent={batch?.progressPercent ?? 0}
          />
        ) : finished ? (
          <ResultStep
            success={batch?.successRows ?? 0}
            place={batch?.placeRows ?? 0}
            failed={batch?.failedRows ?? 0}
            errorMessage={batch?.errorMessage ?? null}
            onAgain={reset}
            onClose={() => onOpenChange(false)}
          />
        ) : isPreviewed && batch ? (
          <PreviewStep
            batch={batch}
            rows={rows?.items ?? []}
            totalRows={rows?.meta?.total ?? batch.totalRows}
            confirmPending={confirmMut.isPending}
            onChangeFile={reset}
            onApply={applyPreview}
          />
        ) : (
          <ProgressStep title="Memuat…" />
        )}
      </DialogContent>
    </Dialog>
  );
}

function UploadStep({
  file,
  dragOver,
  inputRef,
  pending,
  onDragOver,
  onFile,
  onCancel,
  onStart,
}: {
  file: File | null;
  dragOver: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  pending: boolean;
  onDragOver: (v: boolean) => void;
  onFile: (f: File | undefined) => void;
  onCancel: () => void;
  onStart: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <a
        href={rackImportTemplateUrl()}
        download
        className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm transition-colors hover:bg-primary/10"
      >
        <DownloadIcon className="size-5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="font-medium text-primary">Unduh Template</div>
          <div className="text-xs text-muted-foreground">
            template-import-rack-allocation.xlsx
          </div>
        </div>
      </a>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          onDragOver(true);
        }}
        onDragLeave={() => onDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          onDragOver(false);
          onFile(e.dataTransfer.files[0]);
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
          onChange={(e) => onFile(e.target.files?.[0])}
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
              Format: .csv, .xlsx — Maks 20 MB
            </div>
          </>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Batal
        </Button>
        <Button variant="primary" disabled={!file || pending} onClick={onStart}>
          {pending && <Loader2Icon className="size-4 animate-spin" />}
          Mulai Pratinjau
        </Button>
      </div>
    </div>
  );
}

function ProgressStep({
  title,
  subtitle,
  percent,
}: {
  title: string;
  subtitle?: string;
  percent?: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-10 text-center">
      <Loader2Icon className="size-10 animate-spin text-primary" />
      <div>
        <div className="font-medium">{title}</div>
        {subtitle && (
          <div className="mt-1 text-sm text-muted-foreground">{subtitle}</div>
        )}
      </div>
      {typeof percent === "number" && (
        <div className="w-full max-w-sm">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
            />
          </div>
          <div className="mt-1 text-xs text-muted-foreground tabular-nums">
            {percent}%
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryBadge({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={className}>
      <span className="tabular-nums font-semibold">{value}</span>
      <span className="ml-1 font-normal">{label}</span>
    </Badge>
  );
}

function PreviewStep({
  batch,
  rows,
  totalRows,
  confirmPending,
  onChangeFile,
  onApply,
}: {
  batch: RackImportBatch;
  rows: RackImportRow[];
  totalRows: number;
  confirmPending: boolean;
  onChangeFile: () => void;
  onApply: () => void;
}) {
  const hasProblems = batch.errorRows + batch.manualMoveRows > 0;
  const canApply = batch.placeRows > 0;
  const shownAll = rows.length >= totalRows;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-muted-foreground">Total baris:</span>
        <Badge variant="secondary" className="tabular-nums">
          {batch.totalRows}
        </Badge>
        <SummaryBadge
          value={batch.placeRows}
          label="ditempatkan"
          className="text-success"
        />
        <SummaryBadge
          value={batch.manualMoveRows}
          label="Pindah Bin"
          className="text-warning"
        />
        <SummaryBadge
          value={batch.alreadyRows}
          label="sudah sesuai"
          className="text-muted-foreground"
        />
        <SummaryBadge
          value={batch.errorRows}
          label="gagal"
          className="text-destructive"
        />
        {hasProblems && (
          <a
            href={rackImportErrorsDownloadUrl(batch.id)}
            download
            className="ml-auto"
          >
            <Button variant="outline" size="sm" className="gap-1.5">
              <DownloadIcon className="size-4" />
              Unduh laporan
            </Button>
          </a>
        )}
      </div>

      <div className="max-h-[46vh] overflow-auto rounded-2xl border border-border">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow className="border-b border-border/60 bg-muted/40">
              <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                SKU
              </TableHead>
              <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                Lokasi
              </TableHead>
              <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                Rak
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
            {rows.map((r) => (
              <TableRow
                key={r.id}
                className="border-b border-border/40 last:border-0"
              >
                <TableCell className="px-3 py-2 font-mono text-xs">
                  {r.sku}
                </TableCell>
                <TableCell className="px-3 py-2 text-sm">{r.location}</TableCell>
                <TableCell className="px-3 py-2 text-sm">{r.bin}</TableCell>
                <TableCell className="px-3 py-2">
                  <RowStatusPill status={r.status} />
                </TableCell>
                <TableCell className="px-3 py-2 text-xs text-muted-foreground">
                  {r.message}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {!shownAll && (
        <p className="text-xs text-muted-foreground">
          Menampilkan {rows.length} dari {totalRows} baris. Unduh laporan untuk
          daftar lengkap baris bermasalah.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="outline" onClick={onChangeFile}>
          Ganti File
        </Button>
        <Button
          variant="primary"
          disabled={!canApply || confirmPending}
          onClick={onApply}
        >
          {confirmPending && <Loader2Icon className="size-4 animate-spin" />}
          Terapkan{canApply ? ` (${batch.placeRows})` : ""}
        </Button>
      </div>
    </div>
  );
}

function ResultStep({
  success,
  place,
  failed,
  errorMessage,
  onAgain,
  onClose,
}: {
  success: number;
  place: number;
  failed: number;
  errorMessage: string | null;
  onAgain: () => void;
  onClose: () => void;
}) {
  const allOk = failed === 0 && success >= place;
  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      {allOk ? (
        <CheckCircle2Icon className="size-12 text-success" />
      ) : (
        <TriangleAlertIcon className="size-12 text-warning" />
      )}
      <div>
        <div className="font-medium">
          {allOk ? "Alokasi rak selesai" : "Selesai dengan sebagian gagal"}
        </div>
        <div className="mt-1 text-sm text-muted-foreground">
          {success} dari {place} SKU berhasil ditempatkan
          {failed > 0 ? `, ${failed} gagal` : ""}.
        </div>
        {errorMessage && (
          <div className="mt-1 text-sm text-destructive">{errorMessage}</div>
        )}
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onAgain}>
          Import Lagi
        </Button>
        <Button variant="primary" onClick={onClose}>
          Selesai
        </Button>
      </div>
    </div>
  );
}
