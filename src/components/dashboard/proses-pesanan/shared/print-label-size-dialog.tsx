"use client";

import * as React from "react";
import { create } from "zustand";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PrintLabelOrderInput {
  id: string;
  source?: string | null;
}

export type PrintLabelSize = "thermal_100x150" | "thermal_100x120";

export interface PrintLabelChoice {
  document_size: PrintLabelSize;
}

export type PrintLabelChoiceMap = PrintLabelChoice;

interface DialogState {
  open: boolean;
  orders: PrintLabelOrderInput[];
  resolve: ((val: PrintLabelChoiceMap | null) => void) | null;
  openDialog: (
    orders: PrintLabelOrderInput[],
  ) => Promise<PrintLabelChoiceMap | null>;
  finish: (val: PrintLabelChoiceMap | null) => void;
}

const useDialogStore = create<DialogState>((set, get) => ({
  open: false,
  orders: [],
  resolve: null,
  openDialog: (orders) => {
    return new Promise<PrintLabelChoiceMap | null>((resolve) => {
      set({ open: true, orders, resolve });
    });
  },
  finish: (val) => {
    const { resolve } = get();
    if (resolve) resolve(val);
    set({ open: false, orders: [], resolve: null });
  },
}));

export function openPrintLabelSizeDialog(
  orders: PrintLabelOrderInput[],
): Promise<PrintLabelChoiceMap | null> {
  return useDialogStore.getState().openDialog(orders);
}

const PREF_KEY = "pref:print-label-size";
const DEFAULT_SIZE: PrintLabelSize = "thermal_100x150";

const SIZE_OPTIONS: { value: PrintLabelSize; label: string }[] = [
  { value: "thermal_100x150", label: "10×15 cm (Thermal)" },
  { value: "thermal_100x120", label: "10×12 cm (Thermal)" },
];

function readPref(): PrintLabelSize {
  if (typeof window === "undefined") return DEFAULT_SIZE;
  try {
    const raw = window.localStorage.getItem(PREF_KEY);
    if (raw === "thermal_100x150" || raw === "thermal_100x120") return raw;
  } catch {

  }
  return DEFAULT_SIZE;
}

function writePref(size: PrintLabelSize) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREF_KEY, size);
  } catch {

  }
}

const CHANNEL_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  shopee: "Shopee",
  lazada: "Lazada",
  woocommerce: "WooCommerce",
  tokopedia: "Tokopedia",
  blibli: "Blibli",
  bukalapak: "Bukalapak",
};

const SUPPORTED_LABEL_CHANNELS = new Set(["shopee", "tiktok", "lazada"]);

export function PrintLabelSizeDialog() {
  const open = useDialogStore((s) => s.open);
  const orders = useDialogStore((s) => s.orders);
  const finish = useDialogStore((s) => s.finish);

  const [size, setSize] = React.useState<PrintLabelSize>(DEFAULT_SIZE);

  const groups = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      const src = (o.source ?? "").toLowerCase();
      if (!src) continue;
      map.set(src, (map.get(src) ?? 0) + 1);
    }
    return Array.from(map.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }, [orders]);

  const [prevOpen, setPrevOpen] = React.useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setSize(readPref());
  }

  const handleConfirm = () => {
    writePref(size);
    finish({ document_size: size });
  };

  const handleCancel = () => finish(null);

  const totalOrders = orders.length;
  const unsupported = groups.filter((g) => !SUPPORTED_LABEL_CHANNELS.has(g.source));

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleCancel();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Cetak Label Resi</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {totalOrders} pesanan siap dicetak. 1 lembar = 1 resi.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-muted-foreground text-xs">Ukuran kertas</Label>
            <Select value={size} onValueChange={(v) => setSize(v as PrintLabelSize)}>
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SIZE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {groups.length > 0 && (
            <div className="text-muted-foreground space-y-1 text-xs">
              <div>Pesanan per channel:</div>
              <ul className="ml-4 list-disc">
                {groups.map((g) => (
                  <li key={g.source}>
                    {CHANNEL_LABEL[g.source] ?? g.source.toUpperCase()}: {g.count}
                    {!SUPPORTED_LABEL_CHANNELS.has(g.source) && (
                      <span className="text-destructive"> — belum didukung</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {unsupported.length > 0 && (
            <p className="text-muted-foreground text-xs">
              Channel yang belum didukung akan dilewati; pesanannya perlu dicetak manual.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Batal
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Cetak
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
