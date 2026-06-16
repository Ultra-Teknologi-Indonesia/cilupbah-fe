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
import { TabPagination } from "./tab-pagination"

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

      <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2.5">Tanggal</th>
              <th className="px-3 py-2.5">Channel / Toko</th>
              <th className="px-3 py-2.5">Status</th>
              <th className="px-3 py-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td colSpan={4} className="px-3 py-3">
                    <div className="h-5 w-full animate-pulse rounded bg-muted/60" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={4} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Gagal memuat.{" "}
                  <button className="font-medium text-primary hover:underline" onClick={() => refetch()}>
                    Coba lagi
                  </button>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-10 text-center text-sm text-muted-foreground">
                  Belum ada riwayat upload.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-border/40 last:border-0 align-top hover:bg-muted/30">
                  <td className="px-3 py-2.5 whitespace-nowrap tabular-nums text-muted-foreground">
                    {fmtDate(r.uploadDate)}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="font-medium text-foreground">{r.channelName ?? "—"}</div>
                    {r.shopName && <div className="text-xs text-muted-foreground">{r.shopName}</div>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={
                        "rounded px-1.5 py-0.5 text-[11px] font-medium " +
                        (r.success
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : r.canReupload
                            ? "bg-destructive/10 text-destructive"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400")
                      }
                      title={r.statusMessage ?? undefined}
                    >
                      {r.statusMessage ?? (r.success ? "Sukses" : "—")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      {r.channelUrl && (
                        <Button variant="ghost" size="icon" className="size-8" asChild>
                          <a href={r.channelUrl} target="_blank" rel="noopener noreferrer" title="Buka di channel">
                            <ExternalLinkIcon />
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
                          <RefreshCwIcon className="size-3.5" />
                          Upload ulang
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <TabPagination
        page={page}
        perPage={perPage}
        lastPage={lastPage}
        isFetching={isFetching}
        onPage={(p) => setPage(Math.max(1, Math.min(lastPage, p)))}
        onPerPage={(n) => {
          setPerPage(n)
          setPage(1)
        }}
      />
    </div>
  )
}
