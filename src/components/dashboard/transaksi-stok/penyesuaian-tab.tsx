"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import {
  SlidersHorizontalIcon,
  CheckCircleIcon,
  Trash2Icon,
  PlusIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import type { ColumnDef } from "@tanstack/react-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view"
import { useListState } from "@/hooks/use-list-state"
import {
  useStockAdjustments,
  useApproveStockAdjustment,
  useDeleteStockAdjustment,
} from "@/hooks/transaksi-stok/use-stock-adjustments"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type {
  StockAdjustment,
  StockAdjustmentListParams,
} from "@/types/transaksi-stok/stock-adjustment"
import { formatDate } from "@/lib/format"

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: {
    label: "Draft",
    className: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  },
  APPROVED: {
    label: "Approved",
    className: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
  },
}

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Approved" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

export function PenyesuaianTab() {
  const list = useListState<FilterState>(EMPTY_FILTERS)
  const [deleteTarget, setDeleteTarget] = useState<StockAdjustment | null>(null)
  const [approveTarget, setApproveTarget] = useState<StockAdjustment | null>(null)
  const [approvedBy, setApprovedBy] = useState("")

  const params = useMemo<StockAdjustmentListParams>(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[status]": list.filters.status || undefined,
      "filter[location_id]": list.filters.location_id || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters]
  )

  const { data, isLoading, isFetching } = useStockAdjustments(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const approveMut = useApproveStockAdjustment()
  const deleteMut = useDeleteStockAdjustment()

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0

  const locationOptions = useMemo(
    () => [
      { value: "", label: "Semua Lokasi" },
      ...(locData?.items ?? []).map((l) => ({
        value: l.id,
        label: l.locationName,
      })),
    ],
    [locData]
  )

  const columns = useMemo<ColumnDef<StockAdjustment>[]>(() => [
    {
      accessorKey: "adjustment_no",
      header: "No. Penyesuaian",
      cell: ({ row }) => (
        <span className="font-medium">
          <Link
            href={`/dashboard/transaksi-stok/penyesuaian/${row.original.id}`}
            className="hover:text-primary hover:underline"
          >
            {row.original.adjustment_no}
          </Link>
        </span>
      ),
    },
    {
      accessorKey: "transaction_date",
      header: "Tgl. Transaksi",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.transaction_date)}</span>,
    },
    {
      id: "location",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-foreground">{row.original.location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = STATUS_MAP[row.original.status]
        return (
          <Badge
            variant="outline"
            className={cn("text-[10px] leading-tight", st?.className)}
          >
            {st?.label ?? row.original.status}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_by",
      header: "Dibuat Oleh",
      cell: ({ row }) => <span className="text-foreground">{row.original.created_by}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const item = row.original;
        if (item.status === "DRAFT") {
          return (
            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setApproveTarget(item)}
                aria-label="Approve"
                className="text-emerald-600 hover:text-emerald-700"
              >
                <CheckCircleIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteTarget(item)}
                aria-label="Hapus"
                className="text-destructive hover:text-destructive"
              >
                <Trash2Icon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        }
        return null;
      },
    },
  ], [])

  function handleDelete() {
    if (!deleteTarget) return
    deleteMut.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  function handleApprove() {
    if (!approveTarget || !approvedBy.trim()) return
    approveMut.mutate(
      { id: approveTarget.id, approvedBy: approvedBy.trim() },
      {
        onSuccess: () => {
          setApproveTarget(null)
          setApprovedBy("")
        },
      }
    )
  }

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "penyesuaian-stok.csv",
      [
        "No. Penyesuaian",
        "Tgl. Transaksi",
        "Lokasi",
        "Status",
        "Dibuat Oleh",
      ],
      items.map((item: StockAdjustment) => [
        item.adjustment_no,
        formatDate(item.transaction_date),
        item.location?.location_name ?? "",
        STATUS_MAP[item.status]?.label ?? item.status,
        item.created_by,
      ])
    )
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Button size="sm" asChild className="gap-1.5">
          <Link href="/dashboard/transaksi-stok/penyesuaian/buat">
            <PlusIcon className="h-4 w-4" />
            Buat Penyesuaian
          </Link>
        </Button>
      </div>

      <ResourceListView
        list={list}
        columns={columns}
        rows={items}
        total={total}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Cari no. penyesuaian..."
        onExport={handleExport}
        emptyIcon={SlidersHorizontalIcon}
        emptyTitle="Belum ada penyesuaian stok"
        emptyDescription="Data penyesuaian stok akan muncul di sini."
        filterControls={
          <>
            <Combobox
              options={STATUS_OPTIONS}
              value={list.filters.status}
              onChange={(v) =>
                list.setFilters({ ...list.filters, status: v ?? "" })
              }
              placeholder="Status"
              searchPlaceholder="Cari status"
              className="h-9 bg-background"
            />
            <Combobox
              options={locationOptions}
              value={list.filters.location_id}
              onChange={(v) =>
                list.setFilters({ ...list.filters, location_id: v ?? "" })
              }
              placeholder="Lokasi"
              searchPlaceholder="Cari lokasi"
              className="h-9 bg-background"
            />
          </>
        }
      />

      {/* Approve dialog */}
      <ConfirmDialog
        open={!!approveTarget}
        onOpenChange={(v) => {
          if (!v) {
            setApproveTarget(null)
            setApprovedBy("")
          }
        }}
        title="Setujui Penyesuaian Stok"
        description={`Setujui penyesuaian "${approveTarget?.adjustment_no}"?`}
        confirmLabel="Setujui"
        variant="default"
        loading={approveMut.isPending}
        onConfirm={handleApprove}
      >
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-sm font-medium">Disetujui oleh</label>
          <Input
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            placeholder="Nama penyetuju"
          />
        </div>
      </ConfirmDialog>

      {/* Delete dialog */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        title="Hapus Penyesuaian Stok"
        description={`Apakah Anda yakin ingin menghapus "${deleteTarget?.adjustment_no}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
