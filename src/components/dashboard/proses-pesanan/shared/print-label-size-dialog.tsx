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
import { Skeleton } from "@/components/ui/skeleton";
import { usePrintLabelCapabilities } from "@/hooks/channel/use-print-label-capabilities";
import type {
  PrintCapabilityOption,
  PrintLabelCapabilities,
} from "@/types/channel";

export interface PrintLabelOrderInput {
  id: string;
  source?: string | null;
}

export interface PrintLabelChoice {
  document_type?: string;
  document_size?: string;
}

export type PrintLabelChoiceMap = Record<string, PrintLabelChoice>;

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

const PREF_KEY = (source: string) => `pref:print-label:${source.toLowerCase()}`;

function readPref(source: string): PrintLabelChoice {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PREF_KEY(source));
    return raw ? (JSON.parse(raw) as PrintLabelChoice) : {};
  } catch {
    return {};
  }
}

function writePref(source: string, choice: PrintLabelChoice) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PREF_KEY(source), JSON.stringify(choice));
  } catch {
    /* ignore quota */
  }
}

function defaultValue(options: PrintCapabilityOption[]): string {
  return options.find((o) => o.default)?.value ?? options[0]?.value ?? "";
}

const CHANNEL_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  shopee: "Shopee",
  lazada: "Lazada",
  tokopedia: "Tokopedia",
  blibli: "Blibli",
  bukalapak: "Bukalapak",
};

interface ChannelSectionProps {
  source: string;
  count: number;
  value: PrintLabelChoice;
  onChange: (v: PrintLabelChoice) => void;
  onCapabilitiesResolved: (
    source: string,
    caps: PrintLabelCapabilities | null,
  ) => void;
}

function ChannelSection({
  source,
  count,
  value,
  onChange,
  onCapabilitiesResolved,
}: ChannelSectionProps) {
  const { data: caps, isLoading } = usePrintLabelCapabilities(source);
  const resolvedRef = React.useRef(false);

  React.useEffect(() => {
    if (isLoading || resolvedRef.current) return;
    resolvedRef.current = true;
     
    onCapabilitiesResolved(source, caps ?? null);
  }, [caps, isLoading, onCapabilitiesResolved, source]);

  const title = CHANNEL_LABEL[source] ?? source.toUpperCase();

  return (
    <div className="rounded-md border p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-muted-foreground text-xs">{count} pesanan</div>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-32 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>
      ) : caps &&
        (caps.document_types.length > 0 || caps.document_sizes.length > 0) ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {caps.document_types.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                Jenis dokumen
              </Label>
              <Select
                value={value.document_type ?? defaultValue(caps.document_types)}
                onValueChange={(v) =>
                  onChange({ ...value, document_type: v || undefined })
                }
              >
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {caps.document_types.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {caps.document_sizes.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-muted-foreground text-xs">
                Ukuran kertas
              </Label>
              <Select
                value={value.document_size ?? defaultValue(caps.document_sizes)}
                onValueChange={(v) =>
                  onChange({ ...value, document_size: v || undefined })
                }
              >
                <SelectTrigger size="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {caps.document_sizes.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Channel ini belum mendukung opsi ukuran cetak — akan menggunakan label
          standar.
        </p>
      )}
    </div>
  );
}

export function PrintLabelSizeDialog() {
  const open = useDialogStore((s) => s.open);
  const orders = useDialogStore((s) => s.orders);
  const finish = useDialogStore((s) => s.finish);

  const [choices, setChoices] = React.useState<PrintLabelChoiceMap>({});

  const groups = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const o of orders) {
      const src = (o.source ?? "").toLowerCase();
      if (!src) continue;
      map.set(src, (map.get(src) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([source, count]) => ({
      source,
      count,
    }));
  }, [orders]);

  const [prevOpen, setPrevOpen] = React.useState(open);
  const [prevGroups, setPrevGroups] = React.useState(groups);
  if (open !== prevOpen || groups !== prevGroups) {
    setPrevOpen(open);
    setPrevGroups(groups);
    if (open) {
      const seed: PrintLabelChoiceMap = {};
      for (const g of groups) {
        seed[g.source] = readPref(g.source);
      }
      setChoices(seed);
    }
  }

  const handleCapabilitiesResolved = React.useCallback(
    (source: string, caps: PrintLabelCapabilities | null) => {
      setChoices((prev) => {
        const current = prev[source] ?? {};
        const next: PrintLabelChoice = { ...current };
        if (!next.document_type && caps?.document_types.length) {
          next.document_type = defaultValue(caps.document_types);
        }
        if (!next.document_size && caps?.document_sizes.length) {
          next.document_size = defaultValue(caps.document_sizes);
        }
        return { ...prev, [source]: next };
      });
    },
    [],
  );

  const handleConfirm = () => {
    for (const g of groups) {
      writePref(g.source, choices[g.source] ?? {});
    }
    finish(choices);
  };

  const handleCancel = () => finish(null);

  const totalOrders = orders.length;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleCancel();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cetak Label Resi</DialogTitle>
          <p className="text-muted-foreground text-sm">
            {totalOrders} pesanan siap dicetak. Pilih ukuran per channel.
          </p>
        </DialogHeader>

        <div className="max-h-[60vh] space-y-3 overflow-y-auto">
          {groups.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Tidak ada channel marketplace terdeteksi — label akan dicetak
              dengan format standar.
            </p>
          ) : (
            groups.map((g) => (
              <ChannelSection
                key={g.source}
                source={g.source}
                count={g.count}
                value={choices[g.source] ?? {}}
                onChange={(v) =>
                  setChoices((prev) => ({ ...prev, [g.source]: v }))
                }
                onCapabilitiesResolved={handleCapabilitiesResolved}
              />
            ))
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
