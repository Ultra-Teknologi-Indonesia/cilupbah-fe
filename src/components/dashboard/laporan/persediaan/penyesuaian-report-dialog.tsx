"use client";

import * as React from "react";
import { PrinterIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { ProductPickerCombobox } from "@/components/dashboard/laporan/shared/product-picker-combobox";
import { LocationMultiCombobox } from "@/components/dashboard/laporan/shared/location-multi-combobox";

interface PenyesuaianReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function PenyesuaianReportDialog({
  open,
  onOpenChange,
}: PenyesuaianReportDialogProps) {
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    startOfMonth(),
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [productIds, setProductIds] = React.useState<string[]>([]);
  const [locationIds, setLocationIds] = React.useState<string[]>([]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setStartDate(startOfMonth());
      setEndDate(new Date());
      setProductIds([]);
      setLocationIds([]);
    }
    onOpenChange(next);
  }

  const invalidRange = Boolean(
    startDate && endDate && endDate.getTime() < startDate.getTime(),
  );
  const canCetak = Boolean(startDate && endDate) && !invalidRange;

  function handleCetak() {
    if (!startDate || !endDate || invalidRange) return;
    const start = formatDateISO(startDate);
    const end = formatDateISO(endDate);
    const params = new URLSearchParams();
    if (productIds.length) params.set("product_ids", productIds.join(","));
    if (locationIds.length) params.set("location_ids", locationIds.join(","));
    const qs = params.toString();
    window.open(
      `/dashboard/document-preview/laporan-penyesuaian/${start}_${end}${
        qs ? `?${qs}` : ""
      }`,
      "_blank",
      "noopener,noreferrer",
    );
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cetak Daftar Penyesuaian Stok</DialogTitle>
          <DialogDescription>
            Pilih rentang tanggal. Produk dan lokasi opsional — kosongkan untuk
            semua.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                Tanggal Mulai
              </Label>
              <DatePicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Pilih tanggal"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                Tanggal Akhir
              </Label>
              <DatePicker
                value={endDate}
                onChange={setEndDate}
                placeholder="Pilih tanggal"
              />
            </div>
          </div>
          {invalidRange && (
            <p className="text-xs text-destructive">
              Tanggal akhir harus setelah atau sama dengan tanggal mulai.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Produk (opsional)
            </Label>
            <ProductPickerCombobox
              mode="sku"
              value={productIds}
              onChange={setProductIds}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Lokasi (opsional)
            </Label>
            <LocationMultiCombobox
              value={locationIds}
              onChange={setLocationIds}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleCetak} disabled={!canCetak}>
            <PrinterIcon className="size-4" />
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
