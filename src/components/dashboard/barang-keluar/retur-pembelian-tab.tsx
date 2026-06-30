"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CornerUpLeftIcon, DownloadIcon, PlayIcon, Trash2Icon, PlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { usePurchaseReturns, useProcessPurchaseReturn, useDeletePurchaseReturn } from "@/hooks/barang-keluar/use-purchase-returns"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type { PurchaseReturn, PurchaseReturnStatus } from "@/types/barang-keluar/purchase-return"

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "DRAFT", label: "Draft" },
  { value: "COMPLETED", label: "Selesai" },
]

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  SUBMITTED: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  APPROVED: "border-indigo-300 text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-400",
  COMPLETED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Diajukan",
  APPROVED: "Disetujui",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function formatCurrency(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n)
}


interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

export function ReturPembelianTab() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const [processTarget, setProcessTarget] = useState<PurchaseReturn | null>(null)
  const [processedBy, setProcessedBy] = useState("")
  const processMutation = useProcessPurchaseReturn()

  const [deleteTarget, setDeleteTarget] = useState<PurchaseReturn | null>(null)
  const deleteMutation = useDeletePurchaseReturn()

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

  const { data, isLoading, isFetching } = usePurchaseReturns(params)
  const { data: locData } = useLocations({ perPage: 100 })

  const columns = useMemo<ColumnDef<PurchaseReturn>[]>(() => [
    {
      accessorKey: "return_number",
      header: "No. Retur",
      cell: ({ row }) => <span className="font-medium">{row.original.return_number}</span>,
    },
    {
      id: "supplier",
      header: "Pemasok",
      cell: ({ row }) => <span className="text-foreground">{row.original.supplier?.name ?? "—"}</span>,
    },
    {
      id: "location",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-foreground">{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "return_date",
      header: "Tgl. Retur",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.return_date)}</span>,
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => <span className="tabular-nums text-foreground">{formatCurrency(row.original.total_amount)}</span>,
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
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-1">
              {item.status === "DRAFT" && (
                <>
                  <button
                    type="button"
                    onClick={() => { setProcessTarget(item); setProcessedBy("") }}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20"
                  >
                    <PlayIcon className="h-3.5 w-3.5" />
                    Proses
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20"
                  >
                    <Trash2Icon className="h-3.5 w-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>
        )
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

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "retur-pembelian.csv",
      ["No. Retur", "Pemasok", "Lokasi", "Tgl. Retur", "Total", "Status", "Dibuat Oleh"],
      items.map((r: PurchaseReturn) => [
        r.return_number,
        r.supplier?.name ?? "",
        r.location?.location_name ?? "",
        r.return_date,
        String(r.total_amount),
        STATUS_LABEL[r.status] ?? r.status,
        r.created_by,
      ])
    )
  }, [items])

  return (
    <>
      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. retur, pemasok..."
          align="end"
          onReset={hasActiveFilter ? () => handleFilterChange(EMPTY_FILTERS) : undefined}
          hasFilter={hasActiveFilter}
          activeCount={activeCount}
          gridCols={2}
          leading={
            <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
              <DownloadIcon className="mr-1.5 h-4 w-4" />
              Export CSV
            </Button>
          }
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
            onRowClick={(row) => router.push(`/dashboard/barang-keluar/retur/${row.id}`)}
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
                <CornerUpLeftIcon className="h-10 w-10 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium">Belum ada retur pembelian</p>
                  <p className="mt-1 text-xs">Retur pembelian ke pemasok akan tampil di sini.</p>
                </div>
              </div>
            }
          />
        </div>
      </LiquidGlass>

      <ConfirmDialog
        open={!!processTarget}
        onOpenChange={(open) => { if (!open) setProcessTarget(null) }}
        title="Proses Retur Pembelian"
        description={`Proses retur ${processTarget?.return_number ?? ""}? Stok akan dikurangi sesuai item retur.`}
        confirmLabel="Proses"
        loading={processMutation.isPending}
        onConfirm={() => {
          if (!processTarget || !processedBy.trim()) return
          processMutation.mutate(
            { id: processTarget.id, data: { processed_by: processedBy.trim() } },
            { onSuccess: () => setProcessTarget(null) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="retur-processed-by" className="text-sm font-medium">
            Diproses oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="retur-processed-by"
            placeholder="Nama penanggung jawab"
            value={processedBy}
            onChange={(e) => setProcessedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Hapus Retur"
        description={`Hapus retur ${deleteTarget?.return_number ?? ""}? Aksi ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return
          deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
        }}
      />
    </>
  )
}
