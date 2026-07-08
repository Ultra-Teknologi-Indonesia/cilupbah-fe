"use client";

import { useCallback, useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import type { DateRange } from "react-day-picker";
import { InboxIcon } from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import { DateRangePicker } from "@/components/ui/date-picker";
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view";
import { useListState } from "@/hooks/use-list-state";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import {
  useBinTransferReceiptList,
  type BinTransferReceiptListItem,
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

export function BinTransferReceiptListTable() {
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    urlSync: true,
    namespace: "pbin_selesai",
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

  const { data, isLoading, isFetching } = useBinTransferReceiptList(params);
  const { data: locData } = useLocations({ perPage: 100 });

  const items = useMemo(
    () => (data?.data ?? []) as BinTransferReceiptListItem[],
    [data],
  );
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

  const columns = useMemo<ColumnDef<BinTransferReceiptListItem>[]>(
    () => [
      {
        accessorKey: "receipt_number",
        header: "No. Penerimaan Transfer",
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.receipt_number}
          </span>
        ),
      },
      {
        id: "transfer_number",
        header: "No. Transfer Asal",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.bin_transfer?.transfer_number ?? "—"}
          </span>
        ),
      },
      {
        id: "transfer_date",
        header: "Tgl Transfer",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.bin_transfer?.transfer_date
              ? formatDate(row.original.bin_transfer.transfer_date)
              : "—"}
          </span>
        ),
      },
      {
        accessorKey: "received_at",
        header: "Tgl Terima",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.received_at
              ? formatDate(row.original.received_at)
              : "—"}
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
        accessorKey: "notes",
        header: "Keterangan",
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.notes || "—"}
          </span>
        ),
      },
      {
        accessorKey: "received_by",
        header: "Diterima Oleh",
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.received_by || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  const handleExport = useCallback(() => {
    if (items.length === 0) return;
    exportCsv(
      "penerimaan-transfer-internal.csv",
      [
        "No. Penerimaan Transfer",
        "No. Transfer Asal",
        "Tgl Transfer",
        "Tgl Terima",
        "Lokasi",
        "Keterangan",
        "Diterima Oleh",
      ],
      items.map((it) => [
        it.receipt_number,
        it.bin_transfer?.transfer_number ?? "",
        it.bin_transfer?.transfer_date
          ? formatDate(it.bin_transfer.transfer_date)
          : "",
        it.received_at ? formatDate(it.received_at) : "",
        it.location?.location_name ?? "",
        it.notes ?? "",
        it.received_by ?? "",
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
      searchPlaceholder="Cari no. penerimaan / transfer..."
      onExport={handleExport}
      emptyIcon={InboxIcon}
      emptyTitle="Belum ada penerimaan transfer"
      emptyDescription="Penerimaan transfer barang yang sudah diselesaikan akan tampil di sini."
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
            placeholder="Rentang tanggal terima"
            className="h-9 bg-background"
          />
        </>
      }
    />
  );
}
