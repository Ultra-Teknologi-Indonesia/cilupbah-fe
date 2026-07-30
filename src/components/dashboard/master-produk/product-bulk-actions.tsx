"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { ArchiveIcon, DownloadIcon, RefreshCwIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useBulkArchive,
  useBulkDelete,
} from "@/hooks/master-produk/use-product-actions";
import { useSyncStock } from "@/hooks/master-produk/use-sync-stock";
import type { SyncStockFilters } from "@/hooks/master-produk/use-sync-stock";
import type { Product } from "@/types/master-produk";

export function ProductBulkActions({
  selected,
  table,
  total = 0,
  syncFilters,
}: {
  selected: Product[];
  table: Table<Product>;
  total?: number;
  syncFilters?: SyncStockFilters;
}) {
  const [archiveOpen, setArchiveOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [syncOpen, setSyncOpen] = React.useState(false);
  const [selectAllAcross, setSelectAllAcross] = React.useState(false);
  const [archiveReason, setArchiveReason] = React.useState("");

  const bulkArchive = useBulkArchive();
  const bulkDelete = useBulkDelete();
  const syncStock = useSyncStock();

  const ids = selected.map((p) => p.itemGroupId);

  const allPageSelected = table.getIsAllPageRowsSelected();
  const canSelectAllAcross = allPageSelected && total > selected.length;

  if (!allPageSelected && selectAllAcross) {
    setSelectAllAcross(false);
  }

  return (
    <>
      {canSelectAllAcross &&
        (selectAllAcross ? (
          <span className="text-xs text-muted-foreground">
            Semua {total} produk terpilih.{" "}
            <button
              type="button"
              onClick={() => setSelectAllAcross(false)}
              className="font-medium text-primary hover:underline"
            >
              Batalkan
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setSelectAllAcross(true)}
            className="text-xs font-medium text-primary hover:underline"
          >
            Pilih semua {total} produk
          </button>
        ))}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          toast("Mengekspor produk terpilih", {
            description: `${selected.length} produk`,
          });
          table.resetRowSelection();
        }}
      >
        <DownloadIcon className="size-4" />
        Ekspor
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={syncStock.isPending}
        onClick={() => setSyncOpen(true)}
      >
        <RefreshCwIcon className="size-4" />
        Sinkronkan Stok
        {!selectAllAcross && ` (${selected.length})`}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setArchiveReason("");
          setArchiveOpen(true);
        }}
      >
        <ArchiveIcon className="size-4" />
        Arsipkan
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2Icon className="size-4" />
        Hapus
      </Button>

      <ConfirmDialog
        open={syncOpen}
        onOpenChange={setSyncOpen}
        title="Sinkronkan Stok ke Channel"
        description={
          selectAllAcross
            ? "Sinkronkan stok SEMUA produk ke channel? Ini memproses banyak item di latar belakang."
            : `Sinkronkan stok ${selected.length} produk ke channel?`
        }
        confirmLabel="Sinkronkan"
        loading={syncStock.isPending}
        onConfirm={() => {
          const payload = selectAllAcross
            ? ({ mode: "all", filters: syncFilters } as const)
            : ({ mode: "bulk", productIds: ids } as const);
          syncStock.mutate(payload, {
            onSuccess: () => {
              setSyncOpen(false);
              setSelectAllAcross(false);
              table.resetRowSelection();
            },
          });
        }}
      />

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Arsipkan Produk"
        description={`${selected.length} produk akan dipindahkan ke arsip dan tidak lagi aktif.`}
        confirmLabel="Arsipkan"
        loading={bulkArchive.isPending}
        onConfirm={() => {
          bulkArchive.mutate(
            { ids, reason: archiveReason || undefined },
            {
              onSuccess: () => {
                setArchiveOpen(false);
                table.resetRowSelection();
              },
            },
          );
        }}
      >
        <div className="py-2">
          <Textarea
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            placeholder="Alasan arsip (opsional)..."
            rows={2}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Produk"
        description={`${selected.length} produk akan dihapus permanen. Produk dengan stok tidak bisa dihapus.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={bulkDelete.isPending}
        onConfirm={() => {
          bulkDelete.mutate(ids, {
            onSuccess: () => {
              setDeleteOpen(false);
              table.resetRowSelection();
            },
          });
        }}
      />
    </>
  );
}
