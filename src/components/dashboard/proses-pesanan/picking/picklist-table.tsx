"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SearchIcon,
  RefreshCwIcon,
  MoreHorizontalIcon,
  Loader2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PrinterIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import {
  useDownloadPicklistPdf,
  usePicklists,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { PICKLIST_STATUS_LABEL, type Picklist } from "@/types/proses-pesanan/fulfillment"

import { UbahPickerDialog } from "./ubah-picker-dialog"

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
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [editPicker, setEditPicker] = React.useState<Picklist | null>(null)
  const downloadPdf = useDownloadPicklistPdf()

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ q: debounced || undefined, page, per_page: 20 }),
    [debounced, page]
  )
  const { data, isLoading, isFetching, refetch } = usePicklists(params)

  const picklists = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const columns = React.useMemo<ColumnDef<Picklist>[]>(() => [
    {
      accessorKey: "picklistNo",
      header: "No. Picklist",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.picklistNo}</span>,
    },
    {
      accessorKey: "locationName",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.locationName ?? "—"}</span>,
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
      cell: ({ row }) => {
        const st = PICKLIST_STATUS_LABEL[row.original.status];
        return (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              st?.className
            )}
          >
            {st?.label}
          </span>
        )
      },
    },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Aksi">
                <MoreHorizontalIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-44">
              <DropdownMenuItem
                onSelect={() => router.push(`/dashboard/proses-pesanan/picking/${row.original.id}`)}
              >
                Proses Picking
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEditPicker(row.original)}>
                Ubah Picker
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={downloadPdf.isPending}
                onSelect={() =>
                  downloadPdf.mutate({
                    picklistId: row.original.id,
                    picklistNo: row.original.picklistNo,
                  })
                }
              >
                <PrinterIcon className="size-4" />
                Cetak Picklist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [router, downloadPdf]);

  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari no. picklist…"
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
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
            <div className="py-16 text-center text-sm text-muted-foreground">
              Tidak ada picklist.
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
    </LiquidGlass>
  )
}
