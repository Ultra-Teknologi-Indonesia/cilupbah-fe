"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { DollarSignIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Combobox } from "@/components/ui/combobox"
import type { ColumnDef } from "@tanstack/react-table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view"
import { useListState } from "@/hooks/use-list-state"
import {
  useStockRevaluations,
  useCancelStockRevaluation,
} from "@/hooks/transaksi-stok/use-stock-revaluations"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { exportCsv } from "@/lib/export-csv"
import type {
  StockRevaluation,
  StockRevaluationListParams,
} from "@/types/transaksi-stok/stock-revaluation"
import { formatDate } from "@/lib/format"

interface FilterState {
  status: string
  location_id: string
}

const EMPTY_FILTERS: FilterState = { status: "", location_id: "" }

const STATUS_MAP: Record<string, { label: string; className: string }> = {
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
  { value: "APPROVED", label: "Approved" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

export function RevaluasiTab() {
  const list = useListState<FilterState>(EMPTY_FILTERS)
  const [cancelTarget, setCancelTarget] = useState<StockRevaluation | null>(
    null
  )

  const params = useMemo<StockRevaluationListParams>(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[status]": list.filters.status || undefined,
      "filter[location_id]": list.filters.location_id || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters]
  )

  const { data, isLoading, isFetching } = useStockRevaluations(params)
  const { data: locData } = useLocations({ perPage: 100 })
  const cancelMut = useCancelStockRevaluation()

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

  const columns = useMemo<ColumnDef<StockRevaluation>[]>(() => [
    {
      accessorKey: "revaluation_no",
      header: "No. Revaluasi",
      cell: ({ row }) => (
        <span className="font-medium">
          <Link
            href={`/dashboard/transaksi-stok/revaluasi/${row.original.id}`}
            className="hover:text-primary hover:underline"
          >
            {row.original.revaluation_no}
          </Link>
        </span>
      ),
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
      accessorKey: "approved_by",
      header: "Disetujui Oleh",
      cell: ({ row }) => <span className="text-foreground">{row.original.approved_by ?? "—"}</span>,
    },
    {
      accessorKey: "approved_at",
      header: "Tgl. Disetujui",
      cell: ({ row }) => <span className="text-foreground">{row.original.approved_at ? formatDate(row.original.approved_at) : "—"}</span>,
    },
  ], [])

  function handleCancel() {
    if (!cancelTarget) return
    cancelMut.mutate(cancelTarget.id, {
      onSuccess: () => setCancelTarget(null),
    })
  }

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "revaluasi-stok.csv",
      [
        "No. Revaluasi",
        "Lokasi",
        "Status",
        "Dibuat Oleh",
        "Disetujui Oleh",
        "Tgl. Disetujui",
      ],
      items.map((item: StockRevaluation) => [
        item.revaluation_no,
        item.location?.location_name ?? "",
        STATUS_MAP[item.status]?.label ?? item.status,
        item.created_by,
        item.approved_by ?? "—",
        item.approved_at ? formatDate(item.approved_at) : "—",
      ])
    )
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      <ResourceListView
        list={list}
        columns={columns}
        rows={items}
        total={total}
        isLoading={isLoading}
        isFetching={isFetching}
        searchPlaceholder="Cari no. revaluasi..."
        onExport={handleExport}
        emptyIcon={DollarSignIcon}
        emptyTitle="Belum ada revaluasi stok"
        emptyDescription="Data revaluasi stok akan muncul di sini."
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

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(v) => !v && setCancelTarget(null)}
        title="Batalkan Revaluasi Stok"
        description={`Apakah Anda yakin ingin membatalkan "${cancelTarget?.revaluation_no}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Batalkan"
        variant="destructive"
        loading={cancelMut.isPending}
        onConfirm={handleCancel}
      />
    </div>
  )
}
