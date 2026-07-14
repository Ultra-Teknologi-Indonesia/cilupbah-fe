"use client";

import {
  XIcon,
  PlayIcon,
  WarehouseIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  FileTextIcon,
  TruckIcon,
  BanIcon,
  PrinterIcon,
  CheckIcon,
  MessageCircleIcon,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { OrderTab, SubFilter } from "@/types/pesanan/order";
import {
  useBulkMarkContacted,
  useMoveToReady,
} from "@/hooks/pesanan/use-order-actions";

export function BulkActionBar({
  tab,
  subFilter,
  count,
  onClear,
  selectedIds,
}: {
  tab: OrderTab;
  subFilter: SubFilter;
  count: number;
  onClear: () => void;
  selectedIds?: string[];
}) {
  if (count === 0) return null;

  const label = `${count} pesanan dipilih`;

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-4 fade-in duration-200">
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-4 py-2.5 shadow-xl shadow-black/10 dark:shadow-black/30">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground"
          onClick={onClear}
        >
          <XIcon className="size-3.5" />
          Batal
        </Button>

        <span className="text-sm font-medium tabular-nums">{label}</span>

        <Separator orientation="vertical" className="!h-5" />

        <TabBulkActions
          tab={tab}
          subFilter={subFilter}
          count={count}
          selectedIds={selectedIds ?? []}
          onDone={onClear}
        />
      </div>
    </div>
  );
}

function TabBulkActions({
  tab,
  subFilter,
  count,
  selectedIds,
  onDone,
}: {
  tab: OrderTab;
  subFilter: SubFilter;
  count: number;
  selectedIds: string[];
  onDone: () => void;
}) {
  const bulkContact = useBulkMarkContacted();
  const moveToReady = useMoveToReady();

  const placeholder = (label: string) => () =>
    toast.info(`${label} untuk ${count} pesanan akan segera tersedia`);

  if (tab === "ready-to-process") {
    return (
      <>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Proses Pesanan")}
        >
          <PlayIcon className="size-3.5" />
          Proses Pesanan
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Edit Gudang")}
        >
          <WarehouseIcon className="size-3.5" />
          Edit Gudang
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Selesaikan")}
        >
          <CheckCircleIcon className="size-3.5" />
          Selesaikan
        </Button>
      </>
    );
  }

  if (tab === "in-transit") {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Cetak Resi")}
        >
          <PrinterIcon className="size-3.5" />
          Cetak Resi
        </Button>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Selesaikan")}
        >
          <CheckCircleIcon className="size-3.5" />
          Selesaikan
        </Button>
      </>
    );
  }

  if (tab === "completed") {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5 text-xs"
        onClick={placeholder("Cetak Faktur")}
      >
        <FileTextIcon className="size-3.5" />
        Cetak Faktur
      </Button>
    );
  }

  if (tab === "empty-stock" || tab === "failed-pick") {
    return (
      <>
        {tab === "empty-stock" && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={bulkContact.isPending || selectedIds.length === 0}
            onClick={() =>
              bulkContact.mutate(
                { orderIds: selectedIds },
                { onSuccess: () => onDone() },
              )
            }
          >
            <MessageCircleIcon className="size-3.5" />
            Tandai Sudah Dihubungi
          </Button>
        )}
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          disabled={moveToReady.isPending || selectedIds.length === 0}
          onClick={() =>
            moveToReady.mutate(selectedIds, { onSuccess: () => onDone() })
          }
        >
          <ArrowRightIcon className="size-3.5" />
          {moveToReady.isPending
            ? "Memindahkan..."
            : "Pindahkan ke Perlu Dikirim"}
        </Button>
      </>
    );
  }

  if (tab === "cancellation") {
    if (subFilter === "cancelled") return null;
    return (
      <>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Terima Pembatalan")}
        >
          <CheckIcon className="size-3.5" />
          Terima Pembatalan
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Tolak Pembatalan")}
        >
          <XIcon className="size-3.5" />
          Tolak Pembatalan
        </Button>
      </>
    );
  }

  if (tab === "returned") {
    if (subFilter === "accepted" || subFilter === "rejected") {
      return (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Cetak Faktur")}
        >
          <FileTextIcon className="size-3.5" />
          Cetak Faktur
        </Button>
      );
    }
    return (
      <>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Terima Retur")}
        >
          <CheckIcon className="size-3.5" />
          Terima Retur
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Tolak Retur")}
        >
          <XIcon className="size-3.5" />
          Tolak Retur
        </Button>
      </>
    );
  }

  if (tab === "all") {
    return (
      <>
        <Button
          size="sm"
          className="h-8 gap-1.5 text-xs"
          onClick={placeholder("Kirim")}
        >
          <TruckIcon className="size-3.5" />
          Kirim
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10"
          onClick={placeholder("Batalkan")}
        >
          <BanIcon className="size-3.5" />
          Batalkan
        </Button>
      </>
    );
  }

  return null;
}
