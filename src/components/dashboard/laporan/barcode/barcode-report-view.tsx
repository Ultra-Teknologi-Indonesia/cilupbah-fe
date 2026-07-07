"use client";

import * as React from "react";
import { AlertCircleIcon, FilterIcon, Loader2Icon, PrinterIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionTitle } from "@/components/dashboard/shared/section-title";
import { ProductPickerCombobox } from "@/components/dashboard/laporan/shared/product-picker-combobox";
import { BarcodeLabelGrid } from "@/components/dashboard/laporan/barcode/barcode-label-grid";
import { useBarcodeReportPreview } from "@/hooks/laporan/use-barcode-report";
import { buildPrintableLabels } from "@/lib/laporan/barcode-labels";
import { printBarcodeLabels } from "@/lib/laporan/print-barcode-labels";
import type { BarcodeHarga, BarcodeJenis } from "@/types/laporan/barcode";

const HARGA_OPTIONS: { value: BarcodeHarga; label: string }[] = [
  { value: "tanpa_harga", label: "Tanpa Harga" },
  { value: "default", label: "Default" },
  { value: "online", label: "Online" },
];

export function BarcodeReportView() {
  const [jenis, setJenis] = React.useState<BarcodeJenis>("sku_induk");
  const [ids, setIds] = React.useState<string[]>([]);
  const [harga, setHarga] = React.useState<BarcodeHarga>("tanpa_harga");

  const preview = useBarcodeReportPreview();

  const canPreview = ids.length > 0 && !preview.isPending;
  const payload = preview.data?.data;

  function handleJenisChange(value: string) {
    setJenis(value as BarcodeJenis);
    setIds([]);
    preview.reset();
  }

  function handlePreview() {
    if (ids.length === 0) return;
    preview.mutate({ jenis, ids, harga });
  }

  function handlePrint() {
    if (!payload) return;
    printBarcodeLabels(buildPrintableLabels(payload.labels, harga), harga);
  }

  const errorMessage = preview.isError
    ? "Gagal memuat pratinjau label. Coba lagi."
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
          Filter Label
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            Jenis Laporan
          </Label>
          <RadioGroup
            value={jenis}
            onValueChange={handleJenisChange}
            className="flex flex-row gap-4"
          >
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="sku" />
              SKU
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <RadioGroupItem value="sku_induk" />
              SKU Induk
            </label>
          </RadioGroup>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">
            {jenis === "sku" ? "SKU" : "SKU Induk"}
          </Label>
          <ProductPickerCombobox
            key={jenis}
            mode={jenis}
            value={ids}
            onChange={setIds}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Harga</Label>
          <Select
            value={harga}
            onValueChange={(v) => setHarga(v as BarcodeHarga)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {HARGA_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <Button
            variant="primary"
            onClick={handlePreview}
            disabled={!canPreview}
          >
            {preview.isPending ? (
              <Loader2Icon className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <FilterIcon className="mr-1.5 size-3.5" />
            )}
            Pratinjau
          </Button>
          {payload && payload.labels.length > 0 && (
            <Button variant="outline" onClick={handlePrint}>
              <PrinterIcon className="mr-1.5 size-3.5" />
              Cetak
            </Button>
          )}
        </div>

        {payload && (
          <p className="text-xs text-muted-foreground">
            {payload.meta.total_labels} label akan dicetak dari{" "}
            {payload.meta.total_variants} SKU.
          </p>
        )}

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
        className="bg-white/30 p-5 dark:bg-white/[0.04]"
      >
        <SectionTitle>Pratinjau Label</SectionTitle>
        <div className="mt-4">
          <BarcodeLabelGrid labels={payload?.labels ?? []} harga={harga} />
        </div>
      </LiquidGlass>
    </div>
  );
}
