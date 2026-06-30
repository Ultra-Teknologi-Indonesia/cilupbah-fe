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
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { usePacklists } from "@/hooks/proses-pesanan/use-fulfillment"
import { PACKLIST_STATUS_LABEL, type Packlist } from "@/types/proses-pesanan/fulfillment"

import { UbahPackerDialog } from "./ubah-packer-dialog"

export function PacklistTable() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [editPacker, setEditPacker] = React.useState<Packlist | null>(null)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ q: debounced || undefined, page, per_page: 20 }),
    [debounced, page]
  )
  const { data, isLoading, isFetching, refetch } = usePacklists(params)

  const packlists = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const columns = React.useMemo<ColumnDef<Packlist>[]>(() => [
    {
      accessorKey: "packlistNo",
      header: "No. Packlist",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.packlistNo}</span>,
    },
    {
      accessorKey: "orderNo",
      header: "No. Pesanan",
      cell: ({ row }) => <span>{row.original.orderNo ?? "—"}</span>,
    },
    {
      accessorKey: "customerName",
      header: "Pelanggan",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.customerName ?? "—"}</span>,
    },
    {
      accessorKey: "locationName",
      header: "Lokasi",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.locationName ?? "—"}</span>,
    },
    {
      accessorKey: "packerName",
      header: "Packer",
      cell: ({ row }) => <span>{row.original.packerName ?? "—"}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = PACKLIST_STATUS_LABEL[row.original.status];
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
                onSelect={() => router.push(`/dashboard/proses-pesanan/packing/${row.original.id}`)}
              >
                Proses Packing
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setEditPacker(row.original)}>
                Ubah Packer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], [router]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari no. packlist…"
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
          data={packlists}
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
              Tidak ada packlist.
            </div>
          }
        />
      </div>

      <UbahPackerDialog
        open={!!editPacker}
        onOpenChange={(o) => !o && setEditPacker(null)}
        packlistId={editPacker?.id ?? null}
        packlistNo={editPacker?.packlistNo ?? null}
        locationId={editPacker?.locationId ?? null}
        currentPackerId={editPacker?.packerId ?? null}
      />
    </div>
  )
}
