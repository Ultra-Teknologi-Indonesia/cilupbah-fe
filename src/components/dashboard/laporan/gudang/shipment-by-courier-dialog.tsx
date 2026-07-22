"use client";

import * as React from "react";
import { PrinterIcon } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LocationMultiCombobox } from "@/components/dashboard/laporan/shared/location-multi-combobox";
import type { OrderPerformanceMode } from "@/types/laporan/laporan-gudang";

interface ShipmentByCourierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MODE_OPTIONS: { value: OrderPerformanceMode; label: string }[] = [
  { value: "detail", label: "Detail" },
  { value: "summary", label: "Summary" },
];

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

export function ShipmentByCourierDialog({
  open,
  onOpenChange,
}: ShipmentByCourierDialogProps) {
  const [mode, setMode] = React.useState<OrderPerformanceMode>("detail");
  const [startDate, setStartDate] = React.useState<Date | undefined>(
    startOfMonth(),
  );
  const [endDate, setEndDate] = React.useState<Date | undefined>(new Date());
  const [locationIds, setLocationIds] = React.useState<string[]>([]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setMode("detail");
      setStartDate(startOfMonth());
      setEndDate(new Date());
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

    const id = `${mode}_${formatDateISO(startDate)}_${formatDateISO(endDate)}`;
    const params = new URLSearchParams();
    if (locationIds.length) params.set("location_ids", locationIds.join(","));
    const qs = params.toString();

    window.open(
      `/dashboard/document-preview/laporan-pengiriman-ekspedisi/${encodeURIComponent(id)}${
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
          <DialogTitle>Pengiriman per Ekspedisi</DialogTitle>
          <DialogDescription>
            Rekap pesanan dan kuantitas dikelompokkan per ekspedisi.
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
              Lokasi (opsional)
            </Label>
            <LocationMultiCombobox
              value={locationIds}
              onChange={setLocationIds}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Mode</Label>
            <RadioGroup
              value={mode}
              onValueChange={(v) => setMode(v as OrderPerformanceMode)}
              className="grid grid-cols-2 gap-2"
            >
              {MODE_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-colors",
                    mode === o.value
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <RadioGroupItem value={o.value} />
                  {o.label}
                </label>
              ))}
            </RadioGroup>
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
