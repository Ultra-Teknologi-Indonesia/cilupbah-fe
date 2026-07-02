"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  PlusIcon,
  ClipboardListIcon,
  Trash2Icon,
} from "lucide-react"
import { format } from "date-fns"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { DataTable } from "@/components/ui/data-table/data-table"
import { DateRangePicker } from "@/components/ui/date-picker"
import type { ColumnDef } from "@tanstack/react-table"

import { usePurchaseOrders, useDeletePurchaseOrder, useBulkDeletePurchaseOrder } from "@/hooks/transaksi-pembelian/use-purchase-orders"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import type { PurchaseOrder, PurchaseOrderListParams } from "@/types/transaksi-pembelian/purchase-order"
import { formatDate, formatCurrency } from "@/lib/format"



interface FilterState {
  location_id: string
  dateRange: DateRange | undefined
}

const EMPTY_FILTERS: FilterState = { location_id: "", dateRange: undefined }

export function PesananListView() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null)
  const [bulkDeleteTarget, setBulkDeleteTarget] = useState<PurchaseOrder[] | null>(null)
  const deleteMut = useDeletePurchaseOrder()
  const bulkDeleteMut = useBulkDeletePurchaseOrder()

  function handleDelete() {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  function handleBulkDelete(table: any) {
    if (!bulkDeleteTarget) return
    const ids = bulkDeleteTarget.map(p => p.id)
    bulkDeleteMut.mutate(ids, {
      onSuccess: () => {
        setBulkDeleteTarget(null)
        table.toggleAllPageRowsSelected(false)
      }
    })
  }

  const resetPage = useCallback(() => setPage(1), [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      resetPage()
    }, 300)
    return () => clearTimeout(timer)
  }, [search, resetPage])

  const handleFilterChange = useCallback((f: FilterState) => {
    setFilters(f)
    resetPage()
  }, [resetPage])

  const params = useMemo<PurchaseOrderListParams>(() => {
    const p: PurchaseOrderListParams = {
      search: debouncedSearch || undefined,
      page,
      per_page: perPage,
      "filter[location_id]": filters.location_id || undefined,
    }
    
    if (filters.dateRange?.from) {
      p["filter[date_from]"] = format(filters.dateRange.from, "yyyy-MM-dd")
    }
    if (filters.dateRange?.to) {
      p["filter[date_to]"] = format(filters.dateRange.to, "yyyy-MM-dd")
    }
    
    return p
  }, [debouncedSearch, page, perPage, filters])

  const { data, isLoading, isFetching } = usePurchaseOrders(params)
  const { data: locData } = useLocations({ perPage: 100 })

  const items = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }
  const activeCount = [filters.location_id, filters.dateRange?.from].filter(Boolean).length


  const locationOptions = useMemo(() => [
    { value: "", label: "Semua Lokasi" },
    ...(locData?.items ?? [])
      .filter((l) => l.isWarehouse && l.locationType !== "TRANSIT")
      .map((l) => ({ value: l.id, label: l.locationName })),
  ], [locData])

  const hasActiveFilter = Boolean(filters.location_id || filters.dateRange?.from)


  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(() => [
    {
      accessorKey: "po_number",
      header: "No. Pesanan",
      cell: ({ row }) => (
        <Link href={`/dashboard/transaksi-pembelian/pesanan/${row.original.id}`} className="font-medium hover:text-primary hover:underline">
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
      cell: ({ row }) => <span>{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "order_date",
      header: "Tgl. Pesanan",
      cell: ({ row }) => <span>{formatDate(row.original.order_date)}</span>,
    },
    {
      accessorKey: "total_amount",
      header: () => <div className="text-right">Nilai</div>,
      cell: ({ row }) => <div className="text-right font-medium tabular-nums">{formatCurrency(row.original.total_amount)}</div>,
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
      id: "bills",
      header: "No. Tagihan",
      cell: ({ row }) => <span>{row.original.bills?.[0]?.bill_number ?? "—"}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (row.original.status === "OPEN" || row.original.status === "DRAFT") {
          return (
            <div className="flex justify-end">
              <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(row.original)} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        }
        return null
      },
    },
  ], [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" asChild>
          <Link href="/dashboard/transaksi-pembelian/pesanan/tambah">
            <PlusIcon className="h-4 w-4" />
            Buat Pesanan
          </Link>
        </Button>
      </div>

      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. pesanan, pemasok..."
          align="end"
          onReset={hasActiveFilter ? () => handleFilterChange(EMPTY_FILTERS) : undefined}
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
        >
          <Combobox
            options={locationOptions}
            value={filters.location_id}
            onChange={(v) => handleFilterChange({ ...filters, location_id: v ?? "" })}
            placeholder="Lokasi"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
          <DateRangePicker
            value={filters.dateRange}
            onChange={(range) => handleFilterChange({ ...filters, dateRange: range })}
            placeholder="Tanggal Pesanan"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        {isFetching && !isLoading && (
          <div className="flex justify-center py-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
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
                <Trash2Icon className="h-4 w-4" />
                Hapus ({selected.length})
              </Button>
            )}
            hideToolbar
            manualPagination
            pagination={{
              pageIndex: page - 1,
              pageSize: perPage,
            }}
            rowCount={meta.total}
            onPaginationChange={(p) => {
              setPage(p.pageIndex + 1)
              setPerPage(p.pageSize)
            }}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
                <ClipboardListIcon className="h-10 w-10 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium">Belum ada pesanan pembelian</p>
                  <p className="mt-1 text-xs">Buat pesanan baru untuk mulai memesan barang dari pemasok.</p>
                </div>
              </div>
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
        // @ts-ignore
        onConfirm={(table) => handleBulkDelete({ toggleAllPageRowsSelected: () => {} })}
      />
    </div>
  )
}
