"use client";
import { EmptyState } from "@/components/ui/empty-state";

import { useState, useMemo } from "react";
import { useListState } from "@/hooks/use-list-state";
import Link from "next/link";
import { PlusIcon, ClipboardListIcon, Trash2Icon, Loader2Icon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DateRangePicker } from "@/components/ui/date-picker";
import type { ColumnDef } from "@tanstack/react-table";

import {
  usePurchaseOrders,
  useDeletePurchaseOrder,
  useBulkDeletePurchaseOrder,
} from "@/hooks/transaksi-pembelian/use-purchase-orders";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import type {
  PurchaseOrder,
  PurchaseOrderListParams,
} from "@/types/transaksi-pembelian/purchase-order";
import { formatDate, formatCurrency } from "@/lib/format";

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

export function PesananListView() {
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    perPage: 20,
    debounceMs: 300,
    namespace: "po",
  });
  const {
    search,
    setSearch,
    debouncedSearch,
    page,
    perPage,
    filters,
    setFilters,
    pagination,
    onPaginationChange,
  } = list;

  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null);
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<
    PurchaseOrder[] | null
  >(null);
  const deleteMut = useDeletePurchaseOrder();
  const bulkDeleteMut = useBulkDeletePurchaseOrder();

  function handleDelete() {
    if (!deleteTarget) return;
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  }

  function handleBulkDelete(table: any) {
    if (!bulkDeleteTarget) return;
    const ids = bulkDeleteTarget.map((p) => p.id);
    bulkDeleteMut.mutate(ids, {
      onSuccess: () => {
        setBulkDeleteTarget(null);
        table.toggleAllPageRowsSelected(false);
      },
    });
  }

  const params = useMemo<PurchaseOrderListParams>(() => {
    const p: PurchaseOrderListParams = {
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[location_id]": filters.location_id || undefined,
    };

    if (filters.date_from) p["filter[date_from]"] = filters.date_from;
    if (filters.date_to) p["filter[date_to]"] = filters.date_to;

    return p;
  }, [debouncedSearch, page, perPage, filters]);

  const { data, isLoading, isFetching } = usePurchaseOrders(params);
  const { data: locData } = useLocations({ perPage: 100 });

  const items = data?.items ?? [];
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: perPage,
    total: 0,
  };
  const activeCount = [filters.location_id, filters.date_from].filter(
    Boolean,
  ).length;

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? [])
        .filter((l) => l.isWarehouse && l.locationType !== "TRANSIT")
        .map((l) => ({ value: l.id, label: l.locationName })),
    ],
    [locData],
  );

  const hasActiveFilter = Boolean(
    filters.location_id || filters.date_from,
  );

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(
    () => [
      {
        accessorKey: "po_number",
        header: "No. Pesanan",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/transaksi-pembelian/pesanan/${row.original.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.original.po_number}
          </Link>
        ),
      },
      {
        id: "pemasok",
        header: "Pemasok",
        cell: ({ row }) => <span>{row.original.contact?.name ?? "—"}</span>,
      },
      {
        id: "lokasi",
        header: "Lokasi",
        cell: ({ row }) => (
          <span>{row.original.location?.location_name ?? "—"}</span>
        ),
      },
      {
        accessorKey: "order_date",
        header: "Tgl. Pesanan",
        cell: ({ row }) => <span>{formatDate(row.original.order_date)}</span>,
      },
      {
        accessorKey: "total_amount",
        header: () => <div className="text-right">Nilai</div>,
        cell: ({ row }) => (
          <div className="text-right font-medium tabular-nums">
            {formatCurrency(row.original.total_amount)}
          </div>
        ),
      },
      {
        accessorKey: "notes",
        header: "Keterangan",
        cell: ({ row }) => (
          <div className="max-w-[160px] truncate">
            {row.original.notes || "—"}
          </div>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (
            row.original.status === "OPEN" ||
            row.original.status === "DRAFT"
          ) {
            return (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setDeleteTarget(row.original)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2Icon className="size-3.5" />
                </Button>
              </div>
            );
          }
          return null;
        },
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass
        radius={24}
        intensity="default"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. pesanan, pemasok..."
          align="end"
          onReset={
            hasActiveFilter
              ? () => setFilters(EMPTY_FILTERS)
              : undefined
          }
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
          trailing={
            <Button variant="primary" asChild>
              <Link href="/dashboard/transaksi-pembelian/pesanan/tambah">
                <PlusIcon className="size-4" />
                Buat Pesanan
              </Link>
            </Button>
          }
        >
          <Combobox
            options={locationOptions}
            value={filters.location_id}
            onChange={(v) =>
              setFilters({ ...filters, location_id: v ?? "" })
            }
            placeholder="Lokasi"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
          <DateRangePicker
            value={{
              from: filters.date_from ? new Date(filters.date_from) : undefined,
              to: filters.date_to ? new Date(filters.date_to) : undefined,
            }}
            onChange={(range) => {
              const toStr = (d?: Date) =>
                d ? d.toISOString().slice(0, 10) : "";
              setFilters({
                ...filters,
                date_from: toStr(range?.from),
                date_to: toStr(range?.to),
              });
            }}
            placeholder="Tanggal Pesanan"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-2">
            <Loader2Icon className="size-4 animate-spin text-primary" />
          </div>
        )}

        <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            isLoading={isLoading}
            enableRowSelection
            bulkActions={(selected, table) => (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setBulkDeleteTarget(selected)}
                className="gap-2"
              >
                <Trash2Icon className="size-4" />
                Hapus ({selected.length})
              </Button>
            )}
            hideToolbar
            manualPagination
            pagination={pagination}
            rowCount={meta.total}
            onPaginationChange={onPaginationChange}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <EmptyState icon={ClipboardListIcon} title="Belum ada pesanan pembelian" description="Buat pesanan baru untuk mulai memesan barang dari pemasok." />
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Pesanan"
        description={`Apakah Anda yakin ingin menghapus pesanan "${deleteTarget?.po_number}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />

      <ConfirmDialog
        open={!!bulkDeleteTarget}
        onOpenChange={(v) => !v && setBulkDeleteTarget(null)}
        title="Hapus Pesanan (Bulk)"
        description={`Apakah Anda yakin ingin menghapus ${bulkDeleteTarget?.length} pesanan yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={bulkDeleteMut.isPending}
        onConfirm={() =>
          handleBulkDelete({ toggleAllPageRowsSelected: () => {} })
        }
      />
    </div>
  );
}
