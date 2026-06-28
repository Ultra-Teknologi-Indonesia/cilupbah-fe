"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { ClipboardListIcon, PackageCheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useReceivablePurchaseOrders } from "@/hooks/barang-masuk/use-purchase-orders-inbound"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import type { PurchaseOrder, PurchaseOrderStatus } from "@/types/transaksi-pembelian/purchase-order"

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "OPEN", label: "Belum Diterima" },
  { value: "PARTIAL_RECEIVED", label: "Diterima Sebagian" },
  { value: "CLOSED", label: "Ditutup" },
  { value: "FULLY_RECEIVED", label: "Selesai" },
]

const STATUS_STYLE: Record<string, string> = {
  OPEN: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PARTIAL_RECEIVED: "border-transparent bg-blue-500/10 text-blue-600 dark:text-blue-400",
  CLOSED: "border-transparent bg-slate-500/10 text-slate-600 dark:text-slate-400",
  FULLY_RECEIVED: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
}

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Belum Diterima",
  PARTIAL_RECEIVED: "Diterima Sebagian",
  CLOSED: "Ditutup",
  FULLY_RECEIVED: "Selesai",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function ProgressBar({ received, total }: { received: number; total: number }) {
  const pct = total > 0 ? Math.round((received / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-amber-500")}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{received} / {total}</span>
    </div>
  )
}


interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

export function PesananPembelianTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

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

  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    "filter[status]": filters.status || undefined,
    "filter[location_id]": filters.location_id || undefined,
  }), [debouncedSearch, page, perPage, filters])

  const { data, isLoading, isFetching } = useReceivablePurchaseOrders(params)
  const { data: locData } = useLocations({ perPage: 100 })

  const columns = useMemo<ColumnDef<PurchaseOrder>[]>(() => [
    {
      accessorKey: "po_number",
      header: "No. PO",
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
      accessorKey: "order_date",
      header: "Tgl. Pesanan",
      cell: ({ row }) => <span>{formatDate(row.original.order_date)}</span>,
    },
    {
      id: "lokasi",
      header: "Lokasi",
      cell: ({ row }) => <span>{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "created_by",
      header: "Dibuat Oleh",
      cell: ({ row }) => <span>{row.original.created_by}</span>,
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const totalQty = row.original.items?.reduce((s: number, i: any) => s + i.qty, 0) ?? 0
        const recvQty = row.original.items?.reduce((s: number, i: any) => s + i.received_qty, 0) ?? 0
        return <ProgressBar received={recvQty} total={totalQty} />
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[row.original.status] ?? "")}>
          {STATUS_LABEL[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const item = row.original;
        if (item.status === "OPEN" || item.status === "PARTIAL_RECEIVED") {
          return (
            <Button size="sm" className="h-8 gap-1.5" asChild>
              <Link href={`/dashboard/barang-masuk/terima-po/${item.id}`}>
                <PackageCheckIcon className="h-4 w-4" />
                Terima
              </Link>
            </Button>
          )
        }
        return null;
      },
    },
  ], [])

  const items = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const locationOptions = useMemo(() => [
    { value: "", label: "Semua Lokasi" },
    ...(locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
  ], [locData])

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. PO, pemasok..."
        align="end"
        onReset={hasActiveFilter ? () => handleFilterChange(EMPTY_FILTERS) : undefined}
        hasFilter={hasActiveFilter}
        activeCount={activeCount}
        gridCols={2}
      >
        <Combobox
          options={STATUS_OPTIONS}
          value={filters.status}
          onChange={(v) => handleFilterChange({ ...filters, status: v ?? "" })}
          placeholder="Status"
          searchPlaceholder="Cari status"
          className="h-9 bg-background"
        />
        <Combobox
          options={locationOptions}
          value={filters.location_id}
          onChange={(v) => handleFilterChange({ ...filters, location_id: v ?? "" })}
          placeholder="Lokasi"
          searchPlaceholder="Cari lokasi"
          className="h-9 bg-background"
        />
      </FilterToolbar>

      {isFetching && !isLoading && (
        <div className="flex justify-center py-1">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

            <div className="px-5 py-5 sm:px-6">
        <DataTable
          columns={columns}
          data={items}
          isLoading={isLoading}
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
                <p className="mt-1 text-xs">Pesanan yang bisa diterima akan tampil di sini.</p>
              </div>
            </div>
          }
        />
      </div>
    </LiquidGlass>
  )
}
