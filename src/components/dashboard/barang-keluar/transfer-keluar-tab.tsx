"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightLeftIcon, DownloadIcon, CheckIcon, TruckIcon, XIcon, Trash2Icon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import {
  useOutboundDrafts,
  useOutboundTransit,
  useOutboundFinished,
  useApproveTransfer,
  useShipTransfer,
  useCancelTransfer,
  useDeleteTransfer,
} from "@/hooks/barang-keluar/use-outbound-transfers"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type { InventoryTransfer } from "@/types/barang-masuk/inventory-transfer"

type SubTab = "draft" | "transit" | "finished"

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: "draft", label: "Baru Dibuat" },
  { key: "transit", label: "Sedang Dikirim" },
  { key: "finished", label: "Selesai" },
]

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  APPROVED: "border-indigo-300 text-indigo-600 dark:border-indigo-500/30 dark:text-indigo-400",
  IN_TRANSIT: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  RECEIVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  APPROVED: "Disetujui",
  IN_TRANSIT: "Dikirim",
  RECEIVED: "Diterima",
  CANCELLED: "Dibatalkan",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="border-b border-border/40 px-3 py-3">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border-b border-border/20 px-3 py-3.5">
          <div className="flex gap-4">
            {Array.from({ length: 6 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface FilterState {
  location_id: string
}

const EMPTY_FILTERS: FilterState = { location_id: "" }

function TransferTable({
  items,
  isLoading,
  isFetching,
  meta,
  page,
  perPage,
  setPage,
  setPerPage,
  resetPage,
  onRowClick,
  actionSlot,
}: {
  items: InventoryTransfer[]
  isLoading: boolean
  isFetching: boolean
  meta: { current_page: number; last_page: number; per_page: number; total: number }
  page: number
  perPage: number
  setPage: (p: number) => void
  setPerPage: (s: number) => void
  resetPage: () => void
  onRowClick: (item: InventoryTransfer) => void
  actionSlot?: (item: InventoryTransfer) => React.ReactNode
}) {
  return (
    <>
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
            <ArrowRightLeftIcon className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium">Belum ada transfer keluar</p>
              <p className="mt-1 text-xs">Transfer antar lokasi yang keluar akan tampil di sini.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    {["No. Transfer", "Tanggal", "Lokasi Asal", "Lokasi Tujuan", "Jumlah Item", "Status", "Aksi"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="cursor-pointer border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40"
                      onClick={() => onRowClick(item)}
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-medium">
                        {item.transfer_number}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                        {item.source_location?.location_name ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                        {item.destination_location?.location_name ?? "—"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                        {item.items?.length ?? 0} item
                      </td>
                      <td className="whitespace-nowrap px-3 py-3">
                        <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[item.status] ?? "")}>
                          {STATUS_LABEL[item.status] ?? item.status}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        {actionSlot?.(item)}
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
              label="transfer"
            />
          </div>
        )}
      </div>
    </>
  )
}

export function TransferKeluarTab() {
  const router = useRouter()
  const [subTab, setSubTab] = useState<SubTab>("draft")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const [approveTarget, setApproveTarget] = useState<InventoryTransfer | null>(null)
  const [approvedBy, setApprovedBy] = useState("")
  const approveMutation = useApproveTransfer()

  const [shipTarget, setShipTarget] = useState<InventoryTransfer | null>(null)
  const [shippedBy, setShippedBy] = useState("")
  const shipMutation = useShipTransfer()

  const [cancelTarget, setCancelTarget] = useState<InventoryTransfer | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const cancelMutation = useCancelTransfer()

  const [deleteTarget, setDeleteTarget] = useState<InventoryTransfer | null>(null)
  const deleteMutation = useDeleteTransfer()

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

  const handleSubTabChange = useCallback((t: SubTab) => {
    setSubTab(t)
    setPage(1)
  }, [])

  const params = useMemo(() => ({
    search: debouncedSearch || undefined,
    page,
    per_page: perPage,
    "filter[source_location_id]": filters.location_id || undefined,
  }), [debouncedSearch, page, perPage, filters])

  const draftQuery = useOutboundDrafts(subTab === "draft" ? params : {})
  const transitQuery = useOutboundTransit(subTab === "transit" ? params : {})
  const finishedQuery = useOutboundFinished(subTab === "finished" ? params : {})

  const activeQuery = subTab === "draft" ? draftQuery : subTab === "transit" ? transitQuery : finishedQuery
  const items = activeQuery.data?.items ?? []
  const meta = activeQuery.data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const { data: locData } = useLocations({ perPage: 100 })
  const locationOptions = useMemo(() => [
    { value: "", label: "Semua Lokasi" },
    ...(locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
  ], [locData])

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      `transfer-keluar-${subTab}.csv`,
      ["No. Transfer", "Tanggal", "Lokasi Asal", "Lokasi Tujuan", "Jumlah Item", "Status"],
      items.map((t: InventoryTransfer) => [
        t.transfer_number,
        t.created_at,
        t.source_location?.location_name ?? "",
        t.destination_location?.location_name ?? "",
        String(t.items?.length ?? 0),
        STATUS_LABEL[t.status] ?? t.status,
      ])
    )
  }, [items, subTab])

  const handleRowClick = useCallback((item: InventoryTransfer) => {
    router.push(`/dashboard/barang-keluar/transfer/${item.id}`)
  }, [router])

  const draftActions = useCallback((item: InventoryTransfer) => (
    <div className="flex items-center gap-1">
      {(item.status === "DRAFT" || item.status === "APPROVED") && (
        <>
          {item.status === "DRAFT" && (
            <button
              type="button"
              onClick={() => { setApproveTarget(item); setApprovedBy("") }}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20"
            >
              <CheckIcon className="h-3.5 w-3.5" />
              Approve
            </button>
          )}
          {item.status === "APPROVED" && (
            <button
              type="button"
              onClick={() => { setShipTarget(item); setShippedBy("") }}
              className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-500/20"
            >
              <TruckIcon className="h-3.5 w-3.5" />
              Kirim
            </button>
          )}
          <button
            type="button"
            onClick={() => { setCancelTarget(item); setCancelReason("") }}
            className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-600 transition-colors hover:bg-amber-500/20"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
          {item.status === "DRAFT" && (
            <button
              type="button"
              onClick={() => setDeleteTarget(item)}
              className="inline-flex items-center gap-1 rounded-md bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/20"
            >
              <Trash2Icon className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      )}
    </div>
  ), [])

  return (
    <>
      <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
        <div className="px-4 pt-4 sm:px-5">
          <div className="flex flex-wrap items-center gap-1">
            {SUB_TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => handleSubTabChange(key)}
                className={cn(
                  "inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  subTab === key
                    ? "bg-foreground/10 text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <FilterToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Cari no. transfer..."
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
            options={locationOptions}
            value={filters.location_id}
            onChange={(v) => handleFilterChange({ ...filters, location_id: v ?? "" })}
            placeholder="Lokasi Asal"
            searchPlaceholder="Cari lokasi"
            className="h-9 bg-background"
          />
        </FilterToolbar>

        <TransferTable
          items={items}
          isLoading={activeQuery.isLoading}
          isFetching={activeQuery.isFetching}
          meta={meta}
          page={page}
          perPage={perPage}
          setPage={setPage}
          setPerPage={setPerPage}
          resetPage={resetPage}
          onRowClick={handleRowClick}
          actionSlot={subTab === "draft" ? draftActions : undefined}
        />
      </LiquidGlass>

      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(open) => { if (!open) setApproveTarget(null) }}
        title="Approve Transfer"
        description={`Approve transfer ${approveTarget?.transfer_number ?? ""}?`}
        confirmLabel="Approve"
        loading={approveMutation.isPending}
        onConfirm={() => {
          if (!approveTarget || !approvedBy.trim()) return
          approveMutation.mutate(
            { id: approveTarget.id, data: { approved_by: approvedBy.trim() } },
            { onSuccess: () => setApproveTarget(null) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="tf-approved-by" className="text-sm font-medium">
            Disetujui oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tf-approved-by"
            placeholder="Nama penyetuju"
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!shipTarget}
        onOpenChange={(open) => { if (!open) setShipTarget(null) }}
        title="Kirim Transfer"
        description={`Kirim transfer ${shipTarget?.transfer_number ?? ""}? Stok akan dikurangi dari lokasi asal.`}
        confirmLabel="Kirim"
        loading={shipMutation.isPending}
        onConfirm={() => {
          if (!shipTarget || !shippedBy.trim()) return
          shipMutation.mutate(
            { id: shipTarget.id, data: { shipped_by: shippedBy.trim() } },
            { onSuccess: () => setShipTarget(null) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="tf-shipped-by" className="text-sm font-medium">
            Dikirim oleh <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tf-shipped-by"
            placeholder="Nama pengirim"
            value={shippedBy}
            onChange={(e) => setShippedBy(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(open) => { if (!open) setCancelTarget(null) }}
        title="Batalkan Transfer"
        description={`Batalkan transfer ${cancelTarget?.transfer_number ?? ""}?`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMutation.isPending}
        onConfirm={() => {
          if (!cancelTarget) return
          cancelMutation.mutate(
            { id: cancelTarget.id, data: { cancelled_by: "admin", cancel_reason: cancelReason.trim() || undefined } },
            { onSuccess: () => setCancelTarget(null) }
          )
        }}
      >
        <div className="px-1 py-2">
          <Label htmlFor="tf-cancel-reason" className="text-sm font-medium">
            Alasan pembatalan
          </Label>
          <Input
            id="tf-cancel-reason"
            placeholder="Alasan (opsional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            className="mt-1.5"
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Hapus Transfer"
        description={`Hapus draft transfer ${deleteTarget?.transfer_number ?? ""}? Aksi ini tidak bisa dibatalkan.`}
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
