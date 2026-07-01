"use client"

import * as React from "react"
import {
  RefreshCwIcon,
  MoreHorizontalIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FilterToolbar } from "@/components/dashboard/master-produk/filter-toolbar"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  useCancelShipment,
  useHandOverShipment,
  useShipments,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { SHIPMENT_STATUS_LABEL, type Shipment } from "@/types/proses-pesanan/fulfillment"

import { DocActions } from "../picking/doc-actions"

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export function ShipmentTable() {
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ status: "SCHEDULED", q: debounced || undefined, page, per_page: 20 }),
    [debounced, page]
  )
  const { data, isLoading, isFetching, refetch } = useShipments(params)
  const handOver = useHandOverShipment()
  const cancel = useCancelShipment()

  const shipments = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const errMsg = (err: unknown, fallback: string) =>
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message)
      : fallback

  const onHandOver = (s: Shipment) => {
    if (!window.confirm(`Serahkan ${s.shipmentNo} (${s.ordersCount} pesanan) ke kurir?`)) return
    handOver.mutate(s.id, {
      onSuccess: () => toast.success(`${s.shipmentNo} diserahkan ke kurir.`),
      onError: (e) => toast.error(errMsg(e, "Gagal serah terima.")),
    })
  }

  const onCancel = (s: Shipment) => {
    if (!window.confirm(`Batalkan pengiriman ${s.shipmentNo}?`)) return
    cancel.mutate(s.id, {
      onSuccess: () => toast.success(`${s.shipmentNo} dibatalkan.`),
      onError: (e) => toast.error(errMsg(e, "Gagal membatalkan pengiriman.")),
    })
  }

  const columns = React.useMemo<ColumnDef<Shipment>[]>(() => [
    {
      accessorKey: "shipmentNo",
      header: "No. Pengiriman",
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.shipmentNo}</span>,
    },
    {
      accessorKey: "courierName",
      header: "Kurir",
      cell: ({ row }) => <span>{row.original.courierName ?? "—"}</span>,
    },
    {
      accessorKey: "shipmentType",
      header: "Tipe",
      cell: ({ row }) => <span className="text-foreground">{row.original.shipmentType ?? "—"}</span>,
    },
    {
      accessorKey: "shipmentDate",
      header: "Tgl. Pengiriman",
      cell: ({ row }) => <span className="text-foreground">{formatDate(row.original.shipmentDate)}</span>,
    },
    {
      accessorKey: "ordersCount",
      header: "Jml. Pesanan",
      cell: ({ row }) => <span className="tabular-nums">{row.original.ordersCount}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const st = SHIPMENT_STATUS_LABEL[row.original.status];
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
              <DropdownMenuItem onSelect={() => DocActions.manifest(row.original.id)}>
                Cetak Manifest
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => onHandOver(row.original)}>
                Serah Terima
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onCancel(row.original)}>
                Batalkan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ], []);

  return (
    <div>
      <FilterToolbar
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Cari no. pengiriman…"
        leading={
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
        }
      />

      <div className="px-4 pb-4 sm:px-5">
        <DataTable
          columns={columns}
          data={shipments}
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
              Tidak ada jadwal pengiriman.
            </div>
          }
        />
      </div>
    </div>
  )
}
