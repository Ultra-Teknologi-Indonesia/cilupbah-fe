"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { ArrowRightLeftIcon, PackageCheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { useIncomingTransfers } from "@/hooks/barang-masuk/use-inventory-transfers"
import { useReceiveTransfer } from "@/hooks/barang-masuk/use-receive-transfer"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import type { InventoryTransfer, InventoryTransferStatus } from "@/types/barang-masuk/inventory-transfer"

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "IN_TRANSIT", label: "Dalam Perjalanan" },
  { value: "RECEIVED", label: "Diterima" },
]

const STATUS_STYLE: Record<string, string> = {
  IN_TRANSIT: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  RECEIVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  IN_TRANSIT: "Dalam Perjalanan",
  RECEIVED: "Diterima",
  CANCELLED: "Dibatalkan",
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
      <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  )
}


interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

export function TransferMasukTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const [receiveTarget, setReceiveTarget] = useState<InventoryTransfer | null>(null)
  const [receivedBy, setReceivedBy] = useState("")
  const receiveMutation = useReceiveTransfer()

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
    "filter[destination_location_id]": filters.location_id || undefined,
  }), [debouncedSearch, page, perPage, filters])

  const { data, isLoading, isFetching } = useIncomingTransfers(params)
  const { data: locData } = useLocations({ perPage: 100 })

  const columns = useMemo<ColumnDef<InventoryTransfer>[]>(() => [
    {
      accessorKey: "transfer_number",
      header: "No. Transfer",
      cell: ({ row }) => <span className="font-medium">{row.original.transfer_number}</span>,
    },
    {
      accessorKey: "shipped_at",
      header: "Tgl. Pengiriman",
      cell: ({ row }) => <span>{row.original.shipped_at ? formatDate(row.original.shipped_at) : "—"}</span>,
    },
    {
      id: "source_location",
      header: "Lokasi Asal",
      cell: ({ row }) => <span>{row.original.source_location?.location_name ?? "—"}</span>,
    },
    {
      id: "destination_location",
      header: "Lokasi Tujuan",
      cell: ({ row }) => <span>{row.original.destination_location?.location_name ?? "—"}</span>,
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
        const recvQty = row.original.items?.reduce((s: number, i: any) => s + (i.received_qty ?? 0), 0) ?? 0
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
        if (item.status === "IN_TRANSIT") {
          return (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 gap-1.5 text-primary hover:text-primary"
              onClick={() => { setReceiveTarget(item); setReceivedBy("") }}
            >
              <PackageCheckIcon className="h-4 w-4" />
              Terima
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
    <>
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. transfer..."
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
          placeholder="Lokasi Tujuan"
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
              <ArrowRightLeftIcon className="h-10 w-10 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada transfer masuk</p>
                <p className="mt-1 text-xs">Transfer barang antar lokasi yang masuk akan tampil di sini.</p>
              </div>
            </div>
          }
        />
      </div>
    </LiquidGlass>

      <ConfirmDialog
        open={!!receiveTarget}
        onOpenChange={(open) => { if (!open) setReceiveTarget(null) }}
        title="Terima Transfer"
        description={`Terima transfer ${receiveTarget?.transfer_number ?? ""}?`}
        confirmLabel="Terima"
        loading={receiveMutation.isPending}
        onConfirm={() => {
          if (!receiveTarget || !receivedBy.trim()) return
          receiveMutation.mutate(
            { id: receiveTarget.id, data: { received_by: receivedBy.trim() } },
            { onSuccess: () => setReceiveTarget(null) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="transfer-received-by" className="text-sm font-medium">
            Diterima oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="transfer-received-by"
            placeholder="Nama penerima"
            value={receivedBy}
            onChange={(e) => setReceivedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>
    </>
  )
}
