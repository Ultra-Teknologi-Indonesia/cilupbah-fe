"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// TODO(hooks): aksi imperatif one-off, migrasi ke hook react-query nanti (legacy)
// eslint-disable-next-line no-restricted-imports
import { OrderService } from "@/services/pesanan/order.service";
import type { OrderTab } from "@/types/pesanan/order";

interface Props {
  tab?: OrderTab;
}

export function ExportOrdersDialog({ tab }: Props) {
  const [open, setOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      await OrderService.exportOrders({
        tab: tab && tab !== "all" ? tab : undefined,
        date_from: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
        date_to: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
      });
      setOpen(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Gagal mengunduh data pesanan.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="size-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Pesanan</DialogTitle>
          <DialogDescription>
            Unduh data pesanan ke file Excel. Kosongkan tanggal untuk mengambil
            semua data.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Dari tanggal</label>
              <DatePicker
                value={dateFrom}
                onChange={setDateFrom}
                placeholder="Pilih tanggal"
              />
            </div>
            <div className="grid gap-1.5">
              <label className="text-sm font-medium">Sampai tanggal</label>
              <DatePicker
                value={dateTo}
                onChange={setDateTo}
                placeholder="Pilih tanggal"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button onClick={onSubmit} disabled={loading} className="gap-2">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Unduh XLSX
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
