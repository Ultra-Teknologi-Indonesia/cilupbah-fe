"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import {
  PlusIcon,
  Trash2Icon,
  ClipboardListIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { usePurchaseOrders, useDeletePurchaseOrder } from "@/hooks/transaksi-pembelian/use-purchase-orders"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import type { PurchaseOrder, PurchaseOrderListParams, PurchaseOrderStatus } from "@/types/transaksi-pembelian/purchase-order"

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "OPEN", label: "Open" },
  { value: "PARTIAL_RECEIVED", label: "Diterima Sebagian" },
  { value: "FULLY_RECEIVED", label: "Diterima Penuh" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  OPEN: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  PARTIAL_RECEIVED: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  FULLY_RECEIVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PARTIAL_RECEIVED: "Sebagian",
  FULLY_RECEIVED: "Diterima",
  CANCELLED: "Batal",
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            {Array.from({ length: 7 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

export function PesananListView() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrder | null>(null)

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

  const params = useMemo<PurchaseOrderListParams>(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    "filter[status]": filters.status || undefined,
    "filter[location_id]": filters.location_id || undefined,
  }), [debouncedSearch, page, perPage, filters])

  const { data, isLoading, isFetching } = usePurchaseOrders(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const deleteMut = useDeletePurchaseOrder()

  const items = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const locationOptions = useMemo(() => [
    { value: "", label: "Semua Lokasi" },
    ...(locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
  ], [locData])

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  function handleDelete() {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button variant="primary" asChild>
          <Link href="/dashboard/transaksi-pembelian/pesanan/tambah">
            <PlusIcon className="h-4 w-4" />
            Tambah Pesanan
          </Link>
        </Button>
      </div>

      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
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

        <div className="px-4 py-3 sm:px-5">
          {isLoading ? (
            <TableSkeleton />
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <ClipboardListIcon className="h-10 w-10" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada pesanan pembelian</p>
                <p className="mt-1 text-xs">Tambah pesanan baru untuk mulai memesan barang dari pemasok.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      {["No. Pesanan", "Pemasok", "Lokasi", "Tgl. Pesanan", "Status", "Nilai", "Keterangan", "No. Tagihan", ""].map((h) => (
                        <th key={h} className={cn("whitespace-nowrap px-3 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground", h === "" ? "text-right" : "text-left")}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item: PurchaseOrder) => (
                      <tr key={item.id} className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40">
                        <td className="whitespace-nowrap px-3 py-3 font-medium">
                          <Link href={`/dashboard/transaksi-pembelian/pesanan/${item.id}`} className="hover:text-primary hover:underline">
                            {item.po_number}
                          </Link>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.contact?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.location?.location_name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {formatDate(item.order_date)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[item.status])}>
                            {STATUS_LABEL[item.status] ?? item.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-medium tabular-nums">
                          {formatCurrency(item.total_amount)}
                        </td>
                        <td className="max-w-[160px] truncate px-3 py-3 text-muted-foreground">
                          {item.notes || "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.bills?.[0]?.bill_number ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          {item.status === "DRAFT" && (
                            <Button variant="ghost" size="icon-sm" onClick={() => setDeleteTarget(item)} className="text-destructive hover:text-destructive">
                              <Trash2Icon className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SimplePagination
                page={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={setPage}
                perPage={meta.per_page}
                onPerPageChange={(s) => { setPerPage(s); resetPage() }}
                pageSizeOptions={[15, 30, 50]}
                total={meta.total}
                label="pesanan"
              />
            </div>
          )}
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
    </div>
  )
}
