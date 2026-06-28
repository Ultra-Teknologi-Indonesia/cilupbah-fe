"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { ArchiveIcon, PlayIcon, CheckCircleIcon, UserPlusIcon, DownloadIcon, UploadIcon } from "lucide-react"

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
import { ImportPutawayDialog } from "@/components/dashboard/barang-masuk/import-putaway-dialog"
import { usePutaways } from "@/hooks/barang-masuk/use-putaway"
import { useAssignPutawayStaff, useStartPutaway, useCompletePutaway } from "@/hooks/barang-masuk/use-putaway-actions"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useUsers } from "@/hooks/pengaturan/use-users"
import { exportCsv } from "@/lib/export-csv"
import type { Putaway, PutawayStatus } from "@/types/barang-masuk/putaway"

const STATUS_OPTIONS = [
  { value: "", label: "Semua" },
  { value: "NOT_STARTED", label: "Belum Mulai" },
  { value: "IN_PROGRESS", label: "Sedang Diproses" },
  { value: "COMPLETED", label: "Selesai" },
]

const STATUS_STYLE: Record<string, string> = {
  NOT_STARTED: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  IN_PROGRESS: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  COMPLETED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<string, string> = {
  NOT_STARTED: "Belum Mulai",
  IN_PROGRESS: "Sedang Diproses",
  COMPLETED: "Selesai",
  CANCELLED: "Dibatalkan",
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

function ProgressBar({ placed, total }: { placed: number; total: number }) {
  const pct = total > 0 ? Math.round((placed / total) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-amber-500")}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">{placed} / {total}</span>
    </div>
  )
}


interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

function handleExportPutaway(items: Putaway[]) {
  const headers = ["No. Penempatan", "Tgl. Penempatan", "Lokasi", "Dibuat Oleh", "Dikerjakan Oleh", "Total Qty", "Qty Placed", "Status"]
  const rows = items.map((item) => {
    const totalQty = item.items?.reduce((s, i) => s + i.qty, 0) ?? 0
    const placedQty = item.items?.reduce((s, i) => s + i.putaway_qty, 0) ?? 0
    return [
      item.putaway_no,
      item.started_at ?? item.created_at,
      item.location?.location_name ?? "",
      item.created_by,
      item.assignee?.name ?? "",
      String(totalQty),
      String(placedQty),
      STATUS_LABEL[item.status] ?? item.status,
    ]
  })
  exportCsv(`penempatan-barang-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows)
}

export function PenempatanBarangTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const [assignTarget, setAssignTarget] = useState<Putaway | null>(null)
  const [assignUserId, setAssignUserId] = useState("")
  const [assignPerformedBy, setAssignPerformedBy] = useState("")
  const [startTarget, setStartTarget] = useState<Putaway | null>(null)
  const [completeTarget, setCompleteTarget] = useState<Putaway | null>(null)
  const [importTarget, setImportTarget] = useState<Putaway | null>(null)

  const assignMutation = useAssignPutawayStaff()
  const startMutation = useStartPutaway()
  const completeMutation = useCompletePutaway()
  const { data: userData } = useUsers({ perPage: 100 })

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

  const { data, isLoading, isFetching } = usePutaways(params)
  const { data: locData } = useLocations({ perPage: 100 })

  const items = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: perPage, total: 0 }

  const locationOptions = useMemo(() => [
    { value: "", label: "Semua Lokasi" },
    ...(locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
  ], [locData])

    const columns = useMemo<ColumnDef<Putaway>[]>(() => [
    {
      accessorKey: "putaway_no",
      header: "No. Penempatan",
      cell: ({ row }) => <span className="font-medium">{row.original.putaway_no}</span>,
    },
    {
      id: "no_pembelian",
      header: "No. Pembelian",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.inbound?.reference_number ?? "—"}</span>,
    },
    {
      id: "tanggal",
      header: "Tgl. Pembelian",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.inbound?.created_at ? formatDate(row.original.inbound.created_at) : "—"}</span>,
    },
    {
      id: "location",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "created_by",
      header: "Dibuat Oleh",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.created_by}</span>,
    },
    {
      id: "assignee",
      header: "Dikerjakan Oleh",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.assignee?.name ?? "—"}</span>,
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => {
        const totalQty = row.original.items?.reduce((s: number, i: any) => s + i.qty, 0) ?? 0
        const placedQty = row.original.items?.reduce((s: number, i: any) => s + i.putaway_qty, 0) ?? 0
        return <ProgressBar placed={placedQty} total={totalQty} />
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
        return (
          <div className="flex items-center gap-1.5">
            {item.status === "NOT_STARTED" && !item.assignee && (
              <button
                type="button"
                onClick={() => { setAssignTarget(item); setAssignUserId(""); setAssignPerformedBy("") }}
                className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-500/20 dark:text-indigo-400"
              >
                <UserPlusIcon className="h-3.5 w-3.5" />
                Assign
              </button>
            )}
            {(item.status === "NOT_STARTED" || item.status === "IN_PROGRESS") && (
              <Link href={`/dashboard/barang-masuk/putaway/${item.id}`}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                >
                  <PlayIcon className="h-3.5 w-3.5" />
                  {item.status === "NOT_STARTED" ? "Mulai" : "Lanjut"}
                </button>
              </Link>
            )}
            {item.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={() => setImportTarget(item)}
                className="inline-flex items-center gap-1 rounded-md bg-violet-500/10 px-2 py-1 text-xs font-medium text-violet-600 transition-colors hover:bg-violet-500/20 dark:text-violet-400"
              >
                <UploadIcon className="h-3.5 w-3.5" />
                Import
              </button>
            )}
            {item.status === "IN_PROGRESS" && (
              <button
                type="button"
                onClick={() => setCompleteTarget(item)}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
              >
                <CheckCircleIcon className="h-3.5 w-3.5" />
                Selesai
              </button>
            )}
          </div>
        )
      },
    },
  ], [])

  const userOptions = useMemo(() =>
    (userData?.items ?? []).map((u) => ({ value: u.id, label: u.name })),
    [userData]
  )

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <>
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      {items.length > 0 && (
        <div className="flex justify-end px-4 pt-3 sm:px-5">
          <Button variant="outline" size="sm" onClick={() => handleExportPutaway(items)}>
            <DownloadIcon className="mr-1.5 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      )}
      <FilterToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari no. penempatan..."
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
              <ArchiveIcon className="h-10 w-10 opacity-20" />
              <div className="text-center">
                <p className="text-sm font-medium">Belum ada penempatan barang</p>
                <p className="mt-1 text-xs">Dokumen penempatan ke rak akan tampil di sini setelah penerimaan.</p>
              </div>
            </div>
          }
        />
      </div>
    </LiquidGlass>

      <ConfirmDialog
        open={!!assignTarget}
        onOpenChange={(open) => { if (!open) setAssignTarget(null) }}
        title="Assign Petugas"
        description={`Assign petugas untuk ${assignTarget?.putaway_no ?? ""}`}
        confirmLabel="Assign"
        loading={assignMutation.isPending}
        onConfirm={() => {
          if (!assignTarget || !assignUserId || !assignPerformedBy.trim()) return
          assignMutation.mutate(
            {
              data: [{ putaway_id: assignTarget.id, assigned_to: Number(assignUserId) }],
              performed_by: assignPerformedBy.trim(),
            },
            { onSuccess: () => setAssignTarget(null) }
          )
        }}
      >
        <div className="flex flex-col gap-3 px-1 py-2">
          <div>
            <Label htmlFor="assign-user" className="text-sm font-medium">
              Petugas <span className="text-red-500">*</span>
            </Label>
            <Combobox
              options={userOptions}
              value={assignUserId}
              onChange={(v) => setAssignUserId(v ?? "")}
              placeholder="Pilih petugas"
              searchPlaceholder="Cari petugas"
              className="mt-1.5 h-9 bg-background"
            />
          </div>
          <div>
            <Label htmlFor="assign-by" className="text-sm font-medium">
              Ditugaskan oleh <span className="text-red-500">*</span>
            </Label>
            <Input
              id="assign-by"
              placeholder="Nama penugasan"
              value={assignPerformedBy}
              onChange={(e) => setAssignPerformedBy(e.target.value)}
              className="mt-1.5"
            />
          </div>
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={!!completeTarget}
        onOpenChange={(open) => { if (!open) setCompleteTarget(null) }}
        title="Selesaikan Putaway"
        description={`Tandai ${completeTarget?.putaway_no ?? ""} sebagai selesai?`}
        confirmLabel="Selesai"
        loading={completeMutation.isPending}
        onConfirm={() => {
          if (!completeTarget) return
          completeMutation.mutate(completeTarget.id, {
            onSuccess: () => setCompleteTarget(null),
          })
        }}
      />

      {importTarget && (
        <ImportPutawayDialog
          open={!!importTarget}
          onOpenChange={(open) => { if (!open) setImportTarget(null) }}
          putawayId={importTarget.id}
          locationId={importTarget.location_id}
          onComplete={() => {}}
        />
      )}
    </>
  )
}
