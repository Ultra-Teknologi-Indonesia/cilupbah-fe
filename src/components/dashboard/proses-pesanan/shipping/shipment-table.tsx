"use client"

import * as React from "react"
import Link from "next/link"
import {
  RefreshCwIcon,
  MoreHorizontalIcon,
  PrinterIcon,
  XCircleIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  useCancelShipment,
  useShipments,
} from "@/hooks/proses-pesanan/use-fulfillment"
import type { Shipment } from "@/types/proses-pesanan/fulfillment"

import { DocActions } from "../picking/doc-actions"

function formatDateTime(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatWeight(gram: number): string {
  if (!gram) return "—"
  const kg = gram / 1000
  return kg < 1
    ? `${gram} g`
    : `${kg.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg`
}

const SHIPMENT_STATUS_OPTIONS = [
  { value: "SCHEDULED", label: "Menunggu" },
  { value: "HANDED_OVER,IN_TRANSIT,DELIVERED", label: "Terkirim" },
]

export function ShipmentTable() {
  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [filter, setFilter] = React.useState<FulfillmentFilterValue>({})

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({
      status: filter.status || "SCHEDULED",
      q: debounced || undefined,
      page,
      per_page: 20,
      courier_code: filter.courier_code,
      shipment_type: filter.shipment_type,
      date_from: filter.date_from,
      date_to: filter.date_to,
    }),
    [debounced, page, filter]
  )
  const { data, isLoading, isFetching, refetch } = useShipments(params)
  const cancel = useCancelShipment()

  const shipments = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const errMsg = (err: unknown, fallback: string) =>
    err && typeof err === "object" && "message" in err
      ? String((err as { message?: unknown }).message)
      : fallback

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
      cell: ({ row }) => (
        <Link
          href={`/dashboard/proses-pesanan/shipping/${row.original.id}`}
          className="font-medium text-primary hover:underline"
        >
          {row.original.shipmentNo}
        </Link>
      ),
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
      accessorKey: "ordersCount",
      header: "Jml. Pesanan",
      cell: ({ row }) => <span className="tabular-nums">{row.original.ordersCount}</span>,
    },
    {
      accessorKey: "totalWeightGram",
      header: "Total Berat",
      cell: ({ row }) => (
        <span className="tabular-nums">{formatWeight(row.original.totalWeightGram)}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Dibuat",
      cell: ({ row }) => (
        <span className="text-foreground text-xs">{formatDateTime(row.original.createdAt)}</span>
      ),
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
                <PrinterIcon className="size-4 mr-2" />
                Cetak Manifest
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => onCancel(row.original)}>
                <XCircleIcon className="size-4 mr-2" />
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
      <FulfillmentFilterBar
        value={filter}
        onChange={(v) => {
          setFilter(v)
          setPage(1)
        }}
        fields={["courier", "shipment_type", "status", "date"]}
        courierMode="courier_code"
        statusOptions={SHIPMENT_STATUS_OPTIONS}
        search={search}
        onSearchChange={(v) => {
          setSearch(v)
          setPage(1)
        }}
        searchPlaceholder="Cari no. pengiriman…"
      />
      <div className="flex items-center justify-end gap-3 border-b border-border/40 px-4 py-2 text-sm text-muted-foreground sm:px-5">
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
