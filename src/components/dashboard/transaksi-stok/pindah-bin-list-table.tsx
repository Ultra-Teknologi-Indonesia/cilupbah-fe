"use client";

import { useMemo, useCallback } from "react";
import Link from "next/link";
import { PackageIcon, PlusIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-picker";
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view";
import { useListState } from "@/hooks/use-list-state";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import {
  useBinTransferList,
  type BinTransferListItem,
} from "@/hooks/transaksi-stok/use-bin-transfer";
import { exportCsv } from "@/lib/export-csv";
import { formatDate } from "@/lib/format";

interface FilterState {
  locationId: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: FilterState = {
  locationId: "",
  dateFrom: "",
  dateTo: "",
};

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

export function PindahBinListTable() {
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    urlSync: true,
    namespace: "pbin",
  });

  const params = useMemo(
    () => ({
      q: list.debouncedSearch || undefined,
      page: list.page,
      perPage: list.perPage,
      locationId: list.filters.locationId || undefined,
      dateFrom: list.filters.dateFrom || undefined,
      dateTo: list.filters.dateTo || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters],
  );

  const { data, isLoading, isFetching } = useBinTransferList(params);
  const { data: locData } = useLocations({ perPage: 100 });

  const items = (data?.data ?? []) as BinTransferListItem[];
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

  const dateRange: DateRange | undefined = useMemo(() => {
    const from = parseDateStr(list.filters.dateFrom);
    const to = parseDateStr(list.filters.dateTo);
    if (!from && !to) return undefined;
    return { from, to };
  }, [list.filters.dateFrom, list.filters.dateTo]);

  const columns = useMemo<ColumnDef<BinTransferListItem>[]>(
    () => [
      {
        accessorKey: "transfer_number",
        header: "No. Transfer Internal",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/transaksi-stok/pindah-bin/${row.original.id}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {row.original.transfer_number}
          </Link>
        ),
      },
      {
        accessorKey: "transfer_date",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatDate(row.original.transfer_date)}
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
        accessorKey: "items_count",
        header: () => <div className="text-right">Jumlah Item</div>,
        cell: ({ row }) => (
          <div className="text-right tabular-nums text-foreground">
            {row.original.items_count ?? 0}
          </div>
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
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/dashboard/transaksi-stok/pindah-bin/${row.original.id}`}
              >
                Lihat
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  const handleExport = useCallback(() => {
    if (items.length === 0) return;
    exportCsv(
      "transfer-internal.csv",
      [
        "No. Transfer Internal",
        "Tanggal",
        "Lokasi",
        "Jumlah Item",
        "Dibuat Oleh",
      ],
      items.map((it) => [
        it.transfer_number,
        formatDate(it.transfer_date),
        it.location?.location_name ?? "",
        String(it.items_count ?? 0),
        it.created_by,
      ]),
    );
  }, [items]);

  return (
    <ResourceListView
      list={list}
      columns={columns}
      rows={items}
      total={total}
      isLoading={isLoading}
      isFetching={isFetching}
      searchPlaceholder="Cari no. transfer internal..."
      onExport={handleExport}
      toolbarTrailing={
        <Button size="sm" asChild className="gap-1.5">
          <Link href="/dashboard/transaksi-stok/pindah-bin">
            <PlusIcon className="h-4 w-4" />
            Tambah Transfer Internal
          </Link>
        </Button>
      }
      emptyIcon={PackageIcon}
      emptyTitle="Belum ada transfer internal"
      emptyDescription="Buat transfer internal baru untuk memindahkan stok antar rak dalam gudang yang sama."
      filterControls={
        <>
          <Combobox
            options={locationOptions}
            value={list.filters.locationId}
            onChange={(v) =>
              list.setFilters({ ...list.filters, locationId: v ?? "" })
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
                dateFrom: toDateStr(range?.from),
                dateTo: toDateStr(range?.to),
              })
            }
            placeholder="Rentang tanggal transfer"
            className="h-9 bg-background"
          />
        </>
      }
    />
  );
}
