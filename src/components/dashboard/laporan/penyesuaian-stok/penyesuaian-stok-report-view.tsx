"use client";

import * as React from "react";
import {
  AlertCircleIcon,
  DownloadIcon,
  FileTextIcon,
  FilterIcon,
  Loader2Icon,
  PrinterIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import { EmptyState } from "@/components/ui/empty-state";
import { ProductPickerCombobox } from "@/components/dashboard/laporan/shared/product-picker-combobox";
import { LocationMultiCombobox } from "@/components/dashboard/laporan/shared/location-multi-combobox";
import { usePenyesuaianStokPdf } from "@/hooks/laporan/use-penyesuaian-stok-report";

function formatDateISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function PenyesuaianStokReportView() {
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    startOfMonth(),
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [productIds, setProductIds] = React.useState<string[]>([]);
  const [locationIds, setLocationIds] = React.useState<string[]>([]);

  const [pdfUrl, setPdfUrl] = React.useState<string | null>(null);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);

  const mutation = usePenyesuaianStokPdf();

  React.useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  const canPreview = Boolean(startDate && endDate) && !mutation.isPending;

  async function handlePreview() {
    if (!startDate || !endDate) return;

    const blob = await mutation.mutateAsync({
      start_date: formatDateISO(startDate),
      end_date: formatDateISO(endDate),
      product_ids: productIds.length ? productIds : undefined,
      location_ids: locationIds.length ? locationIds : undefined,
    });

    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(URL.createObjectURL(blob));
  }

  function handlePrint() {
    iframeRef.current?.contentWindow?.print();
  }

  async function handleDownload() {
    if (!startDate || !endDate) return;

    const blob = await mutation.mutateAsync({
      start_date: formatDateISO(startDate),
      end_date: formatDateISO(endDate),
      product_ids: productIds.length ? productIds : undefined,
      location_ids: locationIds.length ? locationIds : undefined,
      download: true,
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Daftar-Penyesuaian-Stok_${formatDateISO(startDate)}_${formatDateISO(endDate)}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const errorMessage = mutation.isError
    ? "Gagal memuat Daftar Penyesuaian Stok. Coba lagi."
    : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="flex h-fit flex-col gap-4 bg-white/30 p-5 dark:bg-white/[0.04]"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <FilterIcon className="size-4" />
          Filter Periode
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            Tanggal Mulai
          </Label>
          <DatePicker
            value={startDate}
            onChange={setStartDate}
            placeholder="Pilih tanggal"
            className="bg-background"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            Tanggal Akhir
          </Label>
          <DatePicker
            value={endDate}
            onChange={setEndDate}
            placeholder="Pilih tanggal"
            className="bg-background"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Produk</Label>
          <ProductPickerCombobox
            mode="sku"
            value={productIds}
            onChange={setProductIds}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Lokasi</Label>
          <LocationMultiCombobox
            value={locationIds}
            onChange={setLocationIds}
          />
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Button
            variant="primary"
            onClick={handlePreview}
            disabled={!canPreview}
          >
            {mutation.isPending ? (
              <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <FilterIcon className="mr-1.5 size-3.5" />
            )}
            Pratinjau
          </Button>
          {pdfUrl && (
            <Button variant="outline" onClick={handlePrint}>
              <PrinterIcon className="mr-1.5 size-3.5" />
              Cetak
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!canPreview}
          >
            <DownloadIcon className="mr-1.5 size-3.5" />
            Unduh PDF
          </Button>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircleIcon className="mt-0.5 size-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </LiquidGlass>

      <LiquidGlass
        radius={16}
        intensity="subtle"
        className="flex flex-col bg-white/30 p-5 dark:bg-white/[0.04]"
      >
        <SectionTitle>Pratinjau Daftar Penyesuaian Stok</SectionTitle>
        <div className="mt-4 min-h-[70vh] flex-1">
          {pdfUrl ? (
            <iframe
              ref={iframeRef}
              src={pdfUrl}
              title="Daftar Penyesuaian Stok"
              className="h-[75vh] w-full rounded-lg border border-border"
            />
          ) : (
            <EmptyState
              icon={FileTextIcon}
              title="Belum ada pratinjau"
              description="Pilih periode lalu klik Pratinjau untuk menampilkan Daftar Penyesuaian Stok."
            />
          )}
        </div>
      </LiquidGlass>
    </div>
  );
}
