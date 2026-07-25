"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SlidersHorizontalIcon,
  Trash2Icon,
  PlusIcon,
  PrinterIcon,
} from "lucide-react";

import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-picker";
import type { ColumnDef } from "@tanstack/react-table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view";
import { ImportPenyesuaianDialog } from "@/components/dashboard/transaksi-stok/import-penyesuaian-view";
import { useListState } from "@/hooks/use-list-state";
import {
  useStockAdjustments,
  useDeleteStockAdjustment,
  useBulkDeleteStockAdjustment,
} from "@/hooks/transaksi-stok/use-stock-adjustments";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import { exportCsv } from "@/lib/export-csv";
import type {
  StockAdjustment,
  StockAdjustmentListParams,
} from "@/types/transaksi-stok/stock-adjustment";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

interface FilterState {
  location_id: string;
  date_from: string;
  date_to: string;
}

const EMPTY_FILTERS: FilterState = {
  location_id: "",
  date_from: "",
  date_to: "",
};

const BULK_PDF_MAX = 50;

function toDateStr(d?: Date): string {
  if (!d) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDateStr(s: string): Date | undefined {
  if (!s) return undefined;
  return new Date(`${s}T00:00:00`);
}

export function PenyesuaianTab() {
  const router = useRouter();
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    urlSync: true,
    namespace: "adj",
  });
  const [deleteTarget, setDeleteTarget] = useState<StockAdjustment | null>(
    null,
  );
  const [bulkDeleteState, setBulkDeleteState] = useState<{
    ids: string[];
    onDone: () => void;
  } | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const params = useMemo<StockAdjustmentListParams>(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[location_id]": list.filters.location_id || undefined,
      "filter[date_from]": list.filters.date_from || undefined,
      "filter[date_to]": list.filters.date_to || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters],
  );

  const dateRange: DateRange | undefined = useMemo(() => {
    const from = parseDateStr(list.filters.date_from);
    const to = parseDateStr(list.filters.date_to);
    if (!from && !to) return undefined;
    return { from, to };
  }, [list.filters.date_from, list.filters.date_to]);

  const { data, isLoading, isFetching } = useStockAdjustments(params);
  const { data: locData } = useLocations({ perPage: 100 });
  const deleteMut = useDeleteStockAdjustment();
  const bulkDeleteMut = useBulkDeleteStockAdjustment();

  const items = useMemo(() => data?.items ?? [], [data]);
  const total = data?.meta?.total ?? 0;

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    ],
    [locData],
  );

  const columns = useMemo<ColumnDef<StockAdjustment>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Pilih semua"
          />
        ),
        cell: ({ row }) => (
          <div onClick={(e) => e.stopPropagation()}>
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(!!value)}
              aria-label="Pilih baris"
            />
          </div>
        ),
        enableSorting: false,
        enableHiding: false,
        size: 36,
      },
      {
        accessorKey: "adjustment_no",
        header: "No. Koreksi Stok",
        cell: ({ row }) => (
          <span className="font-medium">
            <Link
              href={`/dashboard/transaksi-stok/penyesuaian/${row.original.id}`}
              className="hover:text-primary hover:underline"
            >
              {row.original.adjustment_no}
            </Link>
          </span>
        ),
      },
      {
        accessorKey: "transaction_date",
        header: "Tgl. Transaksi",
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatDate(row.original.transaction_date)}
          </span>
        ),
      },
      {
        id: "location",
        header: "Lokasi",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.location?.location_name ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "created_by",
        header: "Dibuat Oleh",
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.created_by}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Aksi</div>,
        cell: ({ row }) => (
          <div
            className="flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              asChild
              aria-label="Cetak"
            >
              <Link
                href={`/dashboard/document-preview/stock-adjustment/${row.original.id}`}
              >
                <PrinterIcon className="size-3.5" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDeleteTarget(row.original)}
              aria-label="Hapus"
              className="text-destructive hover:text-destructive"
            >
              <Trash2Icon className="size-3.5" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  const handleExport = useCallback(() => {
    if (items.length === 0) return;
    exportCsv(
      "koreksi-stok.csv",
      ["No. Koreksi Stok", "Tgl. Transaksi", "Lokasi", "Dibuat Oleh"],
      items.map((item: StockAdjustment) => [
        item.adjustment_no,
        formatDate(item.transaction_date),
        item.location?.location_name ?? "",
        item.created_by,
      ]),
    );
  }, [items]);

  return (
    <div className="flex flex-col gap-4">
      <ResourceListView
        list={list}
        columns={columns}
        rows={items}
        total={total}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Cari no. koreksi stok..."
        onExport={handleExport}
        enableRowSelection
        getRowId={(row) => row.id}
        bulkActions={(selected, table) => {
          const ids = selected.map((r) => r.id);
          const disablePdf = ids.length > BULK_PDF_MAX;
          return (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={disablePdf}
                onClick={() => {
                  if (disablePdf) {
                    toast.warning(
                      `Maksimal ${BULK_PDF_MAX} dokumen per cetak`,
                    );
                    return;
                  }
                  const path = `/dashboard/document-preview/stock-adjustment-bulk/${ids.join(",")}`;
                  router.push(path);
                }}
                title={
                  disablePdf
                    ? `Maksimal ${BULK_PDF_MAX} dokumen per cetak`
                    : undefined
                }
              >
                <PrinterIcon className="mr-1.5 size-4" />
                Cetak {ids.length}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  setBulkDeleteState({
                    ids,
                    onDone: () => table.resetRowSelection(),
                  })
                }
              >
                <Trash2Icon className="mr-1.5 size-4" />
                Hapus {ids.length}
              </Button>
            </>
          );
        }}
        toolbarTrailing={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5"
              onClick={() => setImportOpen(true)}
            >
              Import
            </Button>
            <Button size="sm" asChild className="gap-1.5">
              <Link href="/dashboard/transaksi-stok/penyesuaian/buat">
                <PlusIcon className="size-4" />
                Koreksi Stok Baru
              </Link>
            </Button>
          </div>
        }
        emptyIcon={SlidersHorizontalIcon}
        emptyTitle="Belum ada koreksi stok"
        emptyDescription="Data koreksi stok akan muncul di sini."
        filterControls={
          <>
            <Combobox
              options={locationOptions}
              value={list.filters.location_id}
              onChange={(v) =>
                list.setFilters({ ...list.filters, location_id: v ?? "" })
              }
              placeholder="Lokasi"
              searchPlaceholder="Cari lokasi"
              className="h-9 bg-background"
            />
            <DateRangePicker
              value={dateRange}
              onChange={(range) =>
                list.setFilters({
                  ...list.filters,
                  date_from: toDateStr(range?.from),
                  date_to: toDateStr(range?.to),
                })
              }
              placeholder="Rentang tanggal transaksi"
              className="h-9 bg-background"
            />
          </>
        }
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Koreksi Stok"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.adjustment_no}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!bulkDeleteState}
        onOpenChange={(v) => !v && setBulkDeleteState(null)}
        title="Hapus Koreksi Stok Terpilih"
        description={`Hapus ${bulkDeleteState?.ids.length ?? 0} koreksi stok? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={bulkDeleteMut.isPending}
        onConfirm={() => {
          if (!bulkDeleteState) return;
          bulkDeleteMut.mutate(bulkDeleteState.ids, {
            onSuccess: () => {
              bulkDeleteState.onDone();
              setBulkDeleteState(null);
            },
          });
        }}
      />

      <ImportPenyesuaianDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
