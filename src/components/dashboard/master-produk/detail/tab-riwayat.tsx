"use client"

import * as React from "react"
import { toast } from "sonner"
import { ExternalLinkIcon, RefreshCwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useProductUploadHistories,
  useReuploadHistory,
} from "@/hooks/master-produk/use-product-tabs"
import type { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "@/components/ui/data-table/data-table"

const STATUS_OPTIONS = [
  { value: "all", label: "Semua status" },
  { value: "success", label: "Sukses" },
  { value: "failed", label: "Gagal" },
  { value: "pending", label: "Diproses" },
]

function fmtDate(iso: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function TabRiwayat({ productId }: { productId: string }) {
  const [status, setStatus] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [perPage, setPerPage] = React.useState(10)

  const { data, isLoading, isError, refetch, isFetching } = useProductUploadHistories(
    productId,
    { page, perPage, status: status || undefined },
    true
  )
  const rows = data?.items ?? []
  const lastPage = data?.meta?.last_page ?? 1

  const reupload = useReuploadHistory(productId)
    const columns = React.useMemo<ColumnDef<any>[]>(() => [
    {
      accessorKey: "uploadDate",
      header: "Tanggal",
      cell: ({ row }) => <span className="whitespace-nowrap tabular-nums text-muted-foreground">{fmtDate(row.original.uploadDate)}</span>,
    },
    {
      id: "channel",
      header: "Channel / Toko",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-foreground">{row.original.channelName ?? "—"}</div>
          {row.original.shopName && <div className="text-xs text-muted-foreground">{row.original.shopName}</div>}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={
            "rounded px-1.5 py-0.5 text-[11px] font-medium " +
            (row.original.success
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : row.original.canReupload
                ? "bg-destructive/10 text-destructive"
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400")
          }
          title={row.original.statusMessage ?? undefined}
        >
          {row.original.statusMessage ?? (row.original.success ? "Sukses" : "—")}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">Aksi</div>,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className="flex items-center justify-end gap-1">
            {r.channelUrl && (
              <Button variant="ghost" size="icon" className="size-8" asChild>
                <a href={r.channelUrl} target="_blank" rel="noopener noreferrer" title="Buka di channel">
                  <ExternalLinkIcon className="h-4 w-4" />
                </a>
              </Button>
            )}
            {r.canReupload && (
              <Button
                variant="outline"
                size="sm"
                disabled={reupload.isPending}
                onClick={() => onReupload(r.id)}
              >
                <RefreshCwIcon className="size-3.5 mr-1.5" />
                Upload ulang
              </Button>
            )}
          </div>
        )
      },
    },
  ], [reupload.isPending])

  const onReupload = (id: string) => {
    reupload.mutate(id, {
      onSuccess: () => toast.success("Produk diantrekan untuk upload ulang"),
      onError: () => toast.error("Gagal mengantrekan upload ulang"),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <Select
          value={status || "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? "" : v)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-[180px]">
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

      <div className="rounded-lg border border-border/60 bg-card overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
            Gagal memuat riwayat.
            <button className="mt-2 font-medium text-primary hover:underline" onClick={() => refetch()}>
              Coba lagi
            </button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={rows}
            isLoading={isLoading}
            hideToolbar
            manualPagination
            pagination={{
              pageIndex: page - 1,
              pageSize: perPage,
            }}
            rowCount={lastPage * perPage}
            onPaginationChange={(p) => {
              setPage(p.pageIndex + 1)
              setPerPage(p.pageSize)
            }}
            tableContainerClassName="border-0 bg-transparent backdrop-blur-none [&_[data-slot=table-header]]:bg-transparent"
            emptyState={
              <div className="flex flex-col items-center justify-center py-10 text-sm text-muted-foreground">
                Belum ada riwayat upload.
              </div>
            }
          />
        )}
      </div>
    </div>
  )
}
