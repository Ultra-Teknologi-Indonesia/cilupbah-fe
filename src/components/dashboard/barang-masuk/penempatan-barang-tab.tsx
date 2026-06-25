"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import Link from "next/link"
import { ArchiveIcon, PlayIcon, CheckCircleIcon, UserPlusIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import { usePutaways } from "@/hooks/barang-masuk/use-putaway"
import { useAssignPutawayStaff, useStartPutaway, useCompletePutaway } from "@/hooks/barang-masuk/use-putaway-actions"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { useUsers } from "@/hooks/pengaturan/use-users"
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
      <span className="text-xs tabular-nums text-muted-foreground">{pct}%</span>
    </div>
  )
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
      {Array.from({ length: 6 }).map((_, i) => (
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

export function PenempatanBarangTab() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(15)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)

  const [assignTarget, setAssignTarget] = useState<Putaway | null>(null)
  const [assignUserId, setAssignUserId] = useState("")
  const [assignPerformedBy, setAssignPerformedBy] = useState("")
  const [startTarget, setStartTarget] = useState<Putaway | null>(null)
  const [completeTarget, setCompleteTarget] = useState<Putaway | null>(null)

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

  const userOptions = useMemo(() =>
    (userData?.items ?? []).map((u) => ({ value: u.id, label: u.name })),
    [userData]
  )

  const hasActiveFilter = Object.values(filters).some(Boolean)
  const activeCount = Object.values(filters).filter(Boolean).length

  return (
    <>
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
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

      <div className="px-4 py-3 sm:px-5">
        {isLoading ? (
          <TableSkeleton />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
            <ArchiveIcon className="h-10 w-10" />
            <div className="text-center">
              <p className="text-sm font-medium">Belum ada penempatan barang</p>
              <p className="mt-1 text-xs">Dokumen penempatan ke rak akan tampil di sini setelah penerimaan.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    {["No. Penempatan", "Tgl. Penempatan", "Lokasi", "Dibuat Oleh", "Dikerjakan Oleh", "Progress", "Status", "Aksi"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: Putaway) => {
                    const totalQty = item.items?.reduce((s, i) => s + i.qty, 0) ?? 0
                    const placedQty = item.items?.reduce((s, i) => s + i.putaway_qty, 0) ?? 0
                    return (
                      <tr key={item.id} className="border-b border-border/20 transition-colors last:border-0 hover:bg-muted/40">
                        <td className="whitespace-nowrap px-3 py-3 font-medium">
                          {item.putaway_no}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.started_at ? formatDate(item.started_at) : formatDate(item.created_at)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.location?.location_name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.created_by}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                          {item.assignee?.name ?? "—"}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <ProgressBar placed={placedQty} total={totalQty} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <Badge variant="outline" className={cn("text-[10px] leading-tight", STATUS_STYLE[item.status] ?? "")}>
                            {STATUS_LABEL[item.status] ?? item.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
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
                                onClick={() => setCompleteTarget(item)}
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20 dark:text-emerald-400"
                              >
                                <CheckCircleIcon className="h-3.5 w-3.5" />
                                Selesai
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
              label="penempatan"
            />
          </div>
        )}
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
    </>
  )
}
