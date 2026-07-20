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
import { Combobox } from "@/components/ui/combobox";
import { DatePicker } from "@/components/ui/date-picker";
import { LocationMultiCombobox } from "@/components/dashboard/laporan/shared/location-multi-combobox";
import { usePutawayNumbers } from "@/hooks/laporan/use-laporan-gudang";

interface PutawayListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function PutawayListDialog({
  open,
  onOpenChange,
}: PutawayListDialogProps) {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [locationIds, setLocationIds] = React.useState<string[]>([]);
  const [putawayIds, setPutawayIds] = React.useState<string[]>([]);

  const locationId = locationIds[0] ?? "";
  const dateISO = date ? formatDateISO(date) : "";

  const { data: putawayOptions, isFetching } = usePutawayNumbers(
    dateISO,
    locationId,
    open,
  );

  // Nomor penempatan terikat pada tanggal dan lokasi, jadi pilihan lama
  // dikosongkan begitu salah satunya berubah.
  function handleDateChange(next: Date | undefined) {
    setDate(next);
    setPutawayIds([]);
  }

  function handleLocationChange(next: string[]) {
    setLocationIds(next.slice(-1));
    setPutawayIds([]);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setDate(new Date());
      setLocationIds([]);
      setPutawayIds([]);
    }
    onOpenChange(next);
  }

  const canCetak = Boolean(date && locationId);

  function handleCetak() {
    if (!date || !locationId) return;

    const params = new URLSearchParams({ location_id: locationId });
    if (putawayIds.length) params.set("putaway_ids", putawayIds.join(","));

    window.open(
      `/dashboard/document-preview/laporan-penempatan-barang/${encodeURIComponent(dateISO)}?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Penempatan Barang</DialogTitle>
          <DialogDescription>
            Rincian isi penempatan pada satu tanggal dan lokasi, berikut sumber
            penerimaan dan rak tujuannya.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Tanggal</Label>
            <DatePicker
              value={date}
              onChange={handleDateChange}
              placeholder="Pilih tanggal"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Lokasi</Label>
            <LocationMultiCombobox
              value={locationIds}
              onChange={handleLocationChange}
            />
            <p className="text-xs text-muted-foreground">
              Laporan ini dicetak untuk satu lokasi.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              No. Penempatan (opsional)
            </Label>
            <Combobox
              multiple
              wrap
              options={putawayOptions ?? []}
              value={putawayIds}
              onChange={setPutawayIds}
              loading={isFetching}
              disabled={!locationId}
              placeholder={
                locationId ? "Semua penempatan" : "Pilih lokasi dulu"
              }
              searchPlaceholder="Cari no. penempatan…"
              emptyText="Tidak ada penempatan pada tanggal ini."
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
