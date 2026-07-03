"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  SlidersHorizontalIcon,
  Trash2Icon,
  PlusIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import type { ColumnDef } from "@tanstack/react-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view"
import { ImportPenyesuaianDialog } from "@/components/dashboard/transaksi-stok/import-penyesuaian-view"
import { useListState } from "@/hooks/use-list-state"
import {
  useStockAdjustments,
  useDeleteStockAdjustment,
} from "@/hooks/transaksi-stok/use-stock-adjustments"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type {
  StockAdjustment,
  StockAdjustmentListParams,
} from "@/types/transaksi-stok/stock-adjustment"
import { formatDate } from "@/lib/format"

interface FilterState {
  location_id: string
}

const EMPTY_FILTERS: FilterState = { location_id: "" }

export function PenyesuaianTab() {
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    urlSync: true,
    namespace: "adj",
  })
  const [deleteTarget, setDeleteTarget] = useState<StockAdjustment | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const params = useMemo<StockAdjustmentListParams>(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[location_id]": list.filters.location_id || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters]
  )

  const { data, isLoading, isFetching } = useStockAdjustments(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const deleteMut = useDeleteStockAdjustment()

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

  const columns = useMemo<ColumnDef<StockAdjustment>[]>(() => [
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
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.transaction_date)}</span>,
    },
    {
      id: "location",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-foreground">{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "created_by",
      header: "Dibuat Oleh",
      cell: ({ row }) => <span className="text-foreground">{row.original.created_by}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setDeleteTarget(row.original)}
            aria-label="Hapus"
            className="text-destructive hover:text-destructive"
          >
            <Trash2Icon className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [])

  function handleDelete() {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "koreksi-stok.csv",
      [
        "No. Koreksi Stok",
        "Tgl. Transaksi",
        "Lokasi",
        "Dibuat Oleh",
      ],
      items.map((item: StockAdjustment) => [
        item.adjustment_no,
        formatDate(item.transaction_date),
        item.location?.location_name ?? "",
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
        searchPlaceholder="Cari no. koreksi stok..."
        onExport={handleExport}
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
                <PlusIcon className="h-4 w-4" />
                Koreksi Stok Baru
              </Link>
            </Button>
          </div>
        }
        emptyIcon={SlidersHorizontalIcon}
        emptyTitle="Belum ada koreksi stok"
        emptyDescription="Data koreksi stok akan muncul di sini."
        filterControls={
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

      <ImportPenyesuaianDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  )
}
