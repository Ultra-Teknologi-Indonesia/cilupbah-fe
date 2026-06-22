"use client"

import * as React from "react"
import Link from "next/link"
import type { ColumnDef, PaginationState } from "@tanstack/react-table"
import { CheckCircle2Icon, PlusIcon, XCircleIcon, FileTextIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAdjustments, useApplyAdjustment, useCancelAdjustment, useDeleteAdjustment } from "@/hooks/harga/use-adjustments"
import type { PriceAdjustment } from "@/types/harga/adjustment"
import { HargaTabBar } from "../harga-tab-bar"
import { FilterToolbar } from "../../master-produk/filter-toolbar"

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  applied: { label: "Diterapkan", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  cancelled: { label: "Dibatalkan", className: "bg-destructive/10 text-destructive" },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? STATUS_LABEL.draft
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${s.className}`}>
      {s.label}
    </span>
  )
}

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export function PenyesuaianListView() {
  const [searchInput, setSearchInput] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState("all")
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  React.useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPagination((p) => ({ ...p, pageIndex: 0 }))
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading } = useAdjustments({
    search: search || undefined,
    status: status === "all" ? undefined : status,
    page: pagination.pageIndex + 1,
    per_page: pagination.pageSize,
  })

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0

  const applyMutation = useApplyAdjustment()
  const cancelMutation = useCancelAdjustment()
  const deleteMutation = useDeleteAdjustment()

  const hasFilter = !!search || status !== "all"
  const onReset = () => {
    setSearchInput("")
    setSearch("")
    setStatus("all")
    setPagination((p) => ({ ...p, pageIndex: 0 }))
  }

  const columns = React.useMemo<ColumnDef<PriceAdjustment>[]>(
    () => [
      {
        accessorKey: "adjustmentNo",
        header: "No. Penyesuaian",
        cell: ({ row }) => (
          <Link
            href={`/dashboard/harga/penyesuaian/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.adjustmentNo}
          </Link>
        ),
      },
      {
        accessorKey: "adjustmentDate",
        header: "Tanggal",
        cell: ({ row }) => (
          <span className="tabular-nums text-sm text-muted-foreground">
            {fmtDate(row.original.adjustmentDate)}
          </span>
        ),
      },
      {
        accessorKey: "type",
        header: "Tipe",
        cell: ({ row }) => (
          <span className="text-sm capitalize">{row.original.type}</span>
        ),
      },
      {
        accessorKey: "itemsCount",
        header: "Jumlah Item",
        cell: ({ row }) => (
          <span className="tabular-nums text-sm">{row.original.itemsCount}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "createdBy",
        header: "Dibuat oleh",
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.createdBy ?? "—"}</span>
        ),
      },
      {
        id: "actions",
        header: () => <div className="text-right">Tindakan</div>,
        enableSorting: false,
        cell: ({ row }) => {
          const adj = row.original
          if (adj.status !== "draft") return null
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={applyMutation.isPending}
                onClick={() => applyMutation.mutate(adj.id)}
              >
                <CheckCircle2Icon className="size-3.5" />
                Terapkan
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(adj.id)}
              >
                <XCircleIcon className="size-3.5" />
                Batal
              </Button>
            </div>
          )
        },
        size: 48,
      },
    ],
    [applyMutation, cancelMutation]
  )

  return (
    <div className="flex flex-col gap-4">
      <LiquidGlass radius={24} intensity="default" className="bg-white/40 dark:bg-white/[0.06]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 pt-3 sm:px-5">
          <div className="overflow-x-auto pb-2">
            <HargaTabBar />
          </div>
          <div className="flex items-center gap-3 pb-2">
            <Button asChild size="sm">
              <Link href="/dashboard/harga/penyesuaian/buat">
                <PlusIcon className="size-4" />
                Buat Penyesuaian
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              Total{" "}
              <span className="font-medium text-foreground tabular-nums">{total}</span>
            </span>
          </div>
        </div>

        <FilterToolbar
          search={searchInput}
          onSearchChange={setSearchInput}
          searchPlaceholder="Cari no. penyesuaian…"
          onReset={hasFilter ? onReset : undefined}
          hasFilter={hasFilter}
          activeCount={[status !== "all"].filter(Boolean).length}
        >
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v)
              setPagination((p) => ({ ...p, pageIndex: 0 }))
            }}
          >
            <SelectTrigger className="h-9 w-auto min-w-[140px] rounded-full bg-background">
              <SelectValue placeholder="Semua status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="applied">Diterapkan</SelectItem>
              <SelectItem value="cancelled">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </FilterToolbar>

        <div className="px-5 py-5 sm:px-6">
          <DataTable
            columns={columns}
            data={items}
            getRowId={(r) => r.id}
            isLoading={isLoading}
            hideToolbar
            manualPagination
            rowCount={total}
            pagination={pagination}
            onPaginationChange={setPagination}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center gap-2 py-8">
                <FileTextIcon className="size-8 text-muted-foreground/50" />
                <span className="text-muted-foreground">Belum ada penyesuaian harga</span>
              </div>
            }
          />
        </div>
      </LiquidGlass>
    </div>
  )
}
