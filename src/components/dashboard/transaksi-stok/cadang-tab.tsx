"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { ShieldIcon, XCircleIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import type { ColumnDef } from "@tanstack/react-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view"
import { StatusBadge } from "@/components/dashboard/shared/status-badge"
import { getStatusMeta } from "@/lib/status"
import { useListState } from "@/hooks/use-list-state"
import {
  useReservedStocks,
  useCancelReservedStock,
} from "@/hooks/transaksi-stok/use-reserved-stocks"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type {
  ReservedStock,
  ReservedStockListParams,
} from "@/types/transaksi-stok/reserved-stock"
import { formatDate } from "@/lib/format"

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

export function CadangTab() {
  const list = useListState<FilterState>(EMPTY_FILTERS)
  const [cancelTarget, setCancelTarget] = useState<ReservedStock | null>(null)

  const params = useMemo<ReservedStockListParams>(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[status]": list.filters.status || undefined,
      "filter[location_id]": list.filters.location_id || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters]
  )

  const { data, isLoading, isFetching } = useReservedStocks(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const cancelMut = useCancelReservedStock()

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    ],
    [locData]
  )

  const columns = useMemo<ColumnDef<ReservedStock>[]>(() => [
    {
      accessorKey: "reserved_stock_no",
      header: "No. Cadangan",
      cell: ({ row }) => (
        <span className="font-medium">
          <Link
            href={`/dashboard/transaksi-stok/cadang/${row.original.id}`}
            className="hover:text-primary hover:underline"
          >
            {row.original.reserved_stock_no}
          </Link>
        </span>
      ),
    },
    {
      id: "location",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-foreground">{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "start_date",
      header: "Tgl. Mulai",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.start_date)}</span>,
    },
    {
      accessorKey: "end_date",
      header: "Tgl. Selesai",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.end_date)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge domain="stock-reserve" status={row.original.status} className="text-[10px] leading-tight" />
      ),
    },
    {
      accessorKey: "created_by",
      header: "Dibuat Oleh",
      cell: ({ row }) => <span className="text-foreground">{row.original.created_by}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const item = row.original;
        if (item.status === "ACTIVE") {
          return (
            <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setCancelTarget(item)}
                aria-label="Batalkan"
                className="text-destructive hover:text-destructive"
              >
                <XCircleIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        }
        return null;
      },
    },
  ], [])

  function handleCancel() {
    if (!cancelTarget) return
    cancelMut.mutate(cancelTarget.id, {
      onSuccess: () => setCancelTarget(null),
    })
  }

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "stok-cadangan.csv",
      [
        "No. Cadangan",
        "Lokasi",
        "Tgl. Mulai",
        "Tgl. Selesai",
        "Status",
        "Dibuat Oleh",
      ],
      items.map((item: ReservedStock) => [
        item.reserved_stock_no,
        item.location?.location_name ?? "",
        formatDate(item.start_date),
        formatDate(item.end_date),
        getStatusMeta("stock-reserve", item.status).label,
        item.created_by,
      ])
    )
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      <ResourceListView
        list={list}
        columns={columns}
        rows={items}
        total={total}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Cari no. cadangan..."
        onExport={handleExport}
        emptyIcon={ShieldIcon}
        emptyTitle="Belum ada stok cadangan"
        emptyDescription="Data stok cadangan akan muncul di sini."
        filterControls={
          <>
            <Combobox
              options={STATUS_OPTIONS}
              value={list.filters.status}
              onChange={(v) =>
                list.setFilters({ ...list.filters, status: v ?? "" })
              }
              placeholder="Status"
              searchPlaceholder="Cari status"
              className="h-9 bg-background"
            />
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
          </>
        }
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Batalkan Stok Cadangan"
        description={`Apakah Anda yakin ingin membatalkan "${cancelTarget?.reserved_stock_no}"? Stok yang dicadangkan akan dikembalikan.`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMut.isPending}
        onConfirm={handleCancel}
      />
    </div>
  )
}
