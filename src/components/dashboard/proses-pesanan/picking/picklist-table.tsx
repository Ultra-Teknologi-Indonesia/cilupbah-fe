"use client"

import * as React from "react"
import Link from "next/link"
import {
  ClipboardListIcon,
  FilterIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PrinterIcon,
  RefreshCwIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  useDownloadPicklistPdf,
  usePicklists,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { PICKLIST_STATUS_LABEL, type Picklist } from "@/types/proses-pesanan/fulfillment"

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
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [status, setStatus] = React.useState<string>("")
  const [editPicker, setEditPicker] = React.useState<Picklist | null>(null)
  const downloadPdf = useDownloadPicklistPdf()

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({
      q: debounced || undefined,
      status: status || undefined,
      page,
      per_page: 20,
    }),
    [debounced, status, page]
  )
  const { data, isLoading, isFetching, refetch } = usePicklists(params)
  const activeFilterCount = status ? 1 : 0

  const picklists = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const columns = React.useMemo<ColumnDef<Picklist>[]>(() => [
    {
      accessorKey: "picklistNo",
      header: "No. Picklist",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/proses-pesanan/picking/proses/${row.original.id}`}
          onClick={(e) => e.stopPropagation()}
          className="cursor-pointer font-medium text-primary hover:underline"
        >
          {row.original.picklistNo}
        </Link>
      ),
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
        <div className="flex items-center justify-end gap-1.5">
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Cetak Picklist"
                  disabled={downloadPdf.isPending}
                  onClick={() =>
                    downloadPdf.mutate({
                      picklistId: row.original.id,
                      picklistNo: row.original.picklistNo,
                    })
                  }
                >
                  {downloadPdf.isPending && downloadPdf.variables?.picklistId === row.original.id ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    <PrinterIcon className="size-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Cetak Picklist</TooltipContent>
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
  ], [downloadPdf]);

  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={activeFilterCount > 0 ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "h-9 gap-2 rounded-full",
                  activeFilterCount > 0 && "border-primary/40 text-primary"
                )}
              >
                <FilterIcon className="size-4" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-64 space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Status Picklist
                </label>
                <Select
                  value={status || "__all"}
                  onValueChange={(v) => {
                    setStatus(v === "__all" ? "" : v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="h-9 w-full">
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
              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => {
                    setStatus("")
                    setPage(1)
                  }}
                >
                  Reset Filter
                </Button>
              )}
            </PopoverContent>
          </Popover>
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
    </LiquidGlass>
  )
}
