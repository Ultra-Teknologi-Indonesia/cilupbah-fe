"use client"

import { useMemo, useCallback } from "react"
import Link from "next/link"
import { ArrowLeftRightIcon, InfoIcon, MoveRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import type { ColumnDef } from "@tanstack/react-table"
import { ResourceListView } from "@/components/dashboard/shared/resource-list-view"
import { StatusBadge } from "@/components/dashboard/shared/status-badge"
import { getStatusMeta } from "@/lib/status"
import { useListState } from "@/hooks/use-list-state"
import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { fetchClient } from "@/lib/api-client"
import { exportCsv } from "@/lib/export-csv"
import type {
  InventoryTransfer,
  InventoryTransferListParams,
} from "@/types/barang-masuk/inventory-transfer"
import type { ApiPaginated } from "@/types/api.types"
import { formatDate } from "@/lib/format"

interface FilterState {
  status: string
}

const EMPTY_FILTERS: FilterState = { status: "" }

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "IN_TRANSIT", label: "Dalam Perjalanan" },
  { value: "RECEIVED", label: "Diterima" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

function useInternalTransfers(params: InventoryTransferListParams = {}) {
  return useQuery({
    queryKey: ["internal-transfer", "list", params],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const sp = new URLSearchParams()
      if (params.search) sp.set("search", params.search)
      if (params.page) sp.set("page", String(params.page))
      if (params.per_page) sp.set("per_page", String(params.per_page))
      if (params["filter[status]"]) sp.set("filter[status]", params["filter[status]"])
      if (params.sort) sp.set("sort", params.sort)

      const res = await fetchClient<ApiPaginated<InventoryTransfer>>(
        `/inventory/transfers?${sp}`
      )
      return { items: res.data ?? [], meta: res.meta }
    },
    staleTime: 30 * 1000,
  })
}

export function TransferTab() {
  const list = useListState<FilterState>(EMPTY_FILTERS, {
    urlSync: true,
    namespace: "trf",
  })

  const params = useMemo<InventoryTransferListParams>(
    () => ({
      search: list.debouncedSearch || undefined,
      page: list.page,
      per_page: list.perPage,
      "filter[status]": list.filters.status || undefined,
    }),
    [list.debouncedSearch, list.page, list.perPage, list.filters]
  )

  const { data, isLoading, isFetching } = useInternalTransfers(params)

  const items = data?.items ?? []
  const total = data?.meta?.total ?? 0

  const columns = useMemo<ColumnDef<InventoryTransfer>[]>(() => [
    {
      accessorKey: "transfer_number",
      header: "No. Transfer",
      cell: ({ row }) => (
        <span className="font-medium">
          <Link
            href={`/dashboard/barang-keluar/transfer/${row.original.id}`}
            className="hover:text-primary hover:underline"
          >
            {row.original.transfer_number}
          </Link>
        </span>
      ),
    },
    {
      id: "source_location",
      header: "Asal",
      cell: ({ row }) => <span className="text-foreground">{row.original.source_location?.location_name ?? "—"}</span>,
    },
    {
      id: "destination_location",
      header: "Tujuan",
      cell: ({ row }) => <span className="text-foreground">{row.original.destination_location?.location_name ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge domain="inventory-transfer" status={row.original.status} className="text-[10px] leading-tight" />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Tgl. Dibuat",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.created_at)}</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/barang-keluar/transfer/${row.original.id}`}>
                Lihat
              </Link>
            </Button>
          </div>
        )
      },
    },
  ], [])

  const handleExport = useCallback(() => {
    if (items.length === 0) return
    exportCsv(
      "internal-transfer.csv",
      ["No. Transfer", "Asal", "Tujuan", "Status", "Tgl. Dibuat"],
      items.map((item: InventoryTransfer) => [
        item.transfer_number,
        item.source_location?.location_name ?? "",
        item.destination_location?.location_name ?? "",
        getStatusMeta("inventory-transfer", item.status).label,
        formatDate(item.created_at),
      ])
    )
  }, [items])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800 dark:border-blue-500/20 dark:bg-blue-950/30 dark:text-blue-300">
        <div className="flex items-start gap-2">
          <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Transfer antar lokasi dibuat dari menu Barang Keluar. Untuk memindahkan
            stok antar bin dalam satu gudang, gunakan tombol di kanan.
          </p>
        </div>
        <Button size="sm" asChild className="shrink-0 gap-1.5">
          <Link href="/dashboard/transaksi-stok/pindah-bin">
            <MoveRightIcon className="h-4 w-4" />
            Pindah Antar Bin
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
        searchPlaceholder="Cari no. transfer..."
        onExport={handleExport}
        emptyIcon={ArrowLeftRightIcon}
        emptyTitle="Belum ada internal transfer"
        emptyDescription="Data transfer internal akan muncul di sini."
        filterControls={
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
        }
      />
    </div>
  )
}
