"use client"

import * as React from "react"
import Link from "next/link"
import {
  ClipboardListIcon,
  MoreHorizontalIcon,
  PrinterIcon,
  RefreshCwIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FulfillmentFilterBar,
  type FulfillmentFilterValue,
} from "@/components/dashboard/proses-pesanan/shared/fulfillment-filter-bar"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePicklists, usePrefetchPicklistDetail } from "@/hooks/proses-pesanan/use-fulfillment"
import { type Picklist } from "@/types/proses-pesanan/fulfillment"
import { StatusBadge } from "@/components/dashboard/shared/status-badge"

import { UbahPickerDialog } from "./ubah-picker-dialog"

const STATUS_OPTIONS = [
  { value: "__all", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "IN_PROGRESS", label: "Diproses" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "FAILED", label: "Gagal" },
  { value: "CANCELLED", label: "Dibatalkan" },
]

function ProgressCell({ done, total }: { done: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((done / total) * 100)) : 0
  return (
    <div className="min-w-[140px]">
      <div className="mb-1 text-xs tabular-nums text-muted-foreground">
        {done} / {total}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PicklistTable() {
  const prefetchPicklist = usePrefetchPicklistDetail()
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [status, setStatus] = React.useState<string>("")
  const [filter, setFilter] = React.useState<FulfillmentFilterValue>({})
  const [editPicker, setEditPicker] = React.useState<Picklist | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({
      q: debounced || undefined,
      status: status || undefined,
      shipping_provider: filter.shipping_provider,
      location_id: filter.location_id,
      source: filter.source,
      channel_shop_id: filter.channel_shop_id,
      label_printed: filter.label_printed as "yes" | "no" | undefined,
      date_from: filter.date_from,
      date_to: filter.date_to,
      zone_id: filter.zone_id,
      page,
      per_page: 20,
    }),
    [debounced, status, filter, page]
  )
  const { data, isLoading, isFetching, refetch } = usePicklists(params)

  const picklists = data?.items ?? []

  // Link sudah prefetch route; warmkan juga data detail picklist saat hover.
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const columns = React.useMemo<ColumnDef<Picklist>[]>(() => [
    {
      accessorKey: "picklistNo",
      header: "No. Picklist",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/proses-pesanan/picking/proses/${row.original.id}`}
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={() => prefetchPicklist(row.original.id)}
          onFocus={() => prefetchPicklist(row.original.id)}
          className="cursor-pointer font-medium text-primary hover:underline"
        >
          {row.original.picklistNo}
        </Link>
      ),
    },
    {
      accessorKey: "locationName",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-foreground">{row.original.locationName ?? "—"}</span>,
    },
    {
      accessorKey: "pickerName",
      header: "Picker",
      cell: ({ row }) => <span>{row.original.pickerName ?? "—"}</span>,
    },
    {
      accessorKey: "itemsCount",
      header: "Total Item",
      cell: ({ row }) => <span className="tabular-nums">{row.original.itemsCount}</span>,
    },
    {
      id: "progress",
      header: "Progress",
      cell: ({ row }) => <ProgressCell done={row.original.qtyPicked} total={row.original.qtyOrdered} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge domain="picklist" status={row.original.status} />,
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1.5">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cetak Picklist"
                >
                  <Link
                    href={`/dashboard/document-preview/picklist/${row.original.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PrinterIcon className="size-4" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Pratinjau & Cetak Picklist</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Aksi">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem onSelect={() => setEditPicker(row.original)}>
                Ubah Picker
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [prefetchPicklist]);

  return (
    <div>
      <FulfillmentFilterBar
        value={filter}
        onChange={(v) => {
          setFilter(v)
          setPage(1)
        }}
        fields={["courier", "location", "channel", "store", "label_printed", "date", "zone"]}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Cari no. picklist…"
      />
      <div className="flex flex-wrap items-center gap-3 border-b border-border/40 px-4 py-2 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Status</span>
          <Select
            value={status || "__all"}
            onValueChange={(v) => {
              setStatus(v === "__all" ? "" : v)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-9 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-full p-1.5 transition-colors hover:bg-muted"
            aria-label="Muat ulang"
          >
            <RefreshCwIcon className={cn("size-4", isFetching && "animate-spin")} />
          </button>
          <span className="flex items-center gap-1.5">
            Total <Badge>{meta.total}</Badge>
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 sm:px-5">
        <DataTable
          columns={columns}
          data={picklists}
          isLoading={isLoading}
          hideToolbar
          manualPagination
          pagination={{
            pageIndex: meta.current_page - 1,
            pageSize: meta.per_page,
          }}
          rowCount={meta.total}
          onPaginationChange={(p) => {
            setPage(p.pageIndex + 1)
          }}
          tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
          emptyState={
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted/60">
                <ClipboardListIcon className="size-8 text-muted-foreground/70" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Belum ada picklist</p>
                <p className="text-xs text-muted-foreground">
                  Buat picklist dari tab &quot;Belum Mulai&quot; untuk memulai proses picking.
                </p>
              </div>
            </div>
          }
        />
      </div>

      <UbahPickerDialog
        open={!!editPicker}
        onOpenChange={(o) => !o && setEditPicker(null)}
        picklistId={editPicker?.id ?? null}
        picklistNo={editPicker?.picklistNo ?? null}
        locationId={editPicker?.locationId ?? null}
        currentPickerId={editPicker?.pickerId ?? null}
      />
    </div>
  )
}
