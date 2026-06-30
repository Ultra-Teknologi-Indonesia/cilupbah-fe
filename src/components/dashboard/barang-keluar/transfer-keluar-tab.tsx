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
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
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
  const columns = useMemo<ColumnDef<InventoryTransfer>[]>(() => [
    {
      accessorKey: "transfer_number",
      header: "No. Transfer",
      cell: ({ row }) => <span className="font-medium">{row.original.transfer_number}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Tanggal",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.created_at)}</span>,
    },
    {
      id: "source_location",
      header: "Lokasi Asal",
      cell: ({ row }) => <span className="text-foreground">{row.original.source_location?.location_name ?? "—"}</span>,
    },
    {
      id: "destination_location",
      header: "Lokasi Tujuan",
      cell: ({ row }) => <span className="text-foreground">{row.original.destination_location?.location_name ?? "—"}</span>,
    },
    {
      id: "items_count",
      header: "Jumlah Item",
      cell: ({ row }) => <span className="tabular-nums text-foreground">{row.original.items?.length ?? 0} item</span>,
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
        return (
          <div onClick={(e) => e.stopPropagation()}>
            {actionSlot?.(row.original)}
          </div>
        )
      },
    },
  ], [actionSlot])
  return (
    <>
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
          onRowClick={onRowClick}
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
                <p className="text-sm font-medium">Belum ada transfer keluar</p>
                <p className="mt-1 text-xs">Transfer antar lokasi yang keluar akan tampil di sini.</p>
              </div>
            </div>
          }
        />
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
  const [perPage, setPerPage] = useState(20)
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
