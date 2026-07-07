"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductPickerCombobox } from "@/components/dashboard/laporan/shared/product-picker-combobox";
import type { BarcodeHarga, BarcodeJenis } from "@/types/laporan/barcode";

interface BarcodeReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HARGA_OPTIONS: { value: BarcodeHarga; label: string }[] = [
  { value: "tanpa_harga", label: "Tanpa Harga" },
  { value: "default", label: "Dengan Harga" },
  { value: "online", label: "Online (semua toko + harga)" },
];

export function BarcodeReportDialog({
  open,
  onOpenChange,
}: BarcodeReportDialogProps) {
  const router = useRouter();
  const [jenis, setJenis] = React.useState<BarcodeJenis>("sku");
  const [ids, setIds] = React.useState<string[]>([]);
  const [harga, setHarga] = React.useState<BarcodeHarga>("tanpa_harga");

  // Reset saat dialog ditutup, supaya pembukaan berikutnya selalu bersih.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setJenis("sku");
      setIds([]);
      setHarga("tanpa_harga");
    }
    onOpenChange(next);
  }

  function handleJenisChange(next: string) {
    setJenis(next as BarcodeJenis);
    setIds([]); // sumber picker berubah (variant vs produk induk)
  }

  function handleCetak() {
    if (ids.length === 0) return;
    const params = new URLSearchParams({ jenis, harga });
    router.push(
      `/dashboard/document-preview/laporan-barcode/${ids.join(",")}?${params.toString()}`,
    );
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cetak Barcode Barang</DialogTitle>
          <DialogDescription>
            Pilih produk dan format harga, lalu cetak label QR.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              Jenis Laporan
            </Label>
            <RadioGroup
              value={jenis}
              onValueChange={handleJenisChange}
              className="flex gap-6"
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

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">
              {jenis === "sku" ? "SKU" : "SKU Induk"}
            </Label>
            <ProductPickerCombobox
              mode={jenis}
              value={ids}
              onChange={setIds}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Harga</Label>
            <Select
              value={harga}
              onValueChange={(v) => setHarga(v as BarcodeHarga)}
            >
              <SelectTrigger>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleCetak}
            disabled={ids.length === 0}
          >
            <PrinterIcon className="size-4" />
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
