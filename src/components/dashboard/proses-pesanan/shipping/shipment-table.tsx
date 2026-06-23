"use client"

import * as React from "react"
import {
  SearchIcon,
  RefreshCwIcon,
  MoreHorizontalIcon,
  Loader2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
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
            placeholder="Cari no. pengiriman…"
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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="px-3 py-3 font-medium">No. Pengiriman</th>
              <th className="px-3 py-3 font-medium">Kurir</th>
              <th className="px-3 py-3 font-medium">Tipe</th>
              <th className="px-3 py-3 font-medium">Tgl. Pengiriman</th>
              <th className="px-3 py-3 font-medium">Jml. Pesanan</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-muted-foreground">
                  <Loader2Icon className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            ) : shipments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-sm text-muted-foreground">
                  Tidak ada jadwal pengiriman.
                </td>
              </tr>
            ) : (
              shipments.map((s) => {
                const st = SHIPMENT_STATUS_LABEL[s.status]
                return (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <td className="px-3 py-2.5 font-medium text-foreground">{s.shipmentNo}</td>
                    <td className="px-3 py-2.5">{s.courierName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{s.shipmentType ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{formatDate(s.shipmentDate)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{s.ordersCount}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          st.className
                        )}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Aksi">
                            <MoreHorizontalIcon className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem onSelect={() => DocActions.manifest(s.id)}>
                            Cetak Manifest
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => onHandOver(s)}>
                            Serah Terima
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onSelect={() => onCancel(s)}>
                            Batalkan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <span className="text-xs text-muted-foreground">
          Halaman {meta.current_page} dari {meta.last_page}
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="icon-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Sebelumnya"
          >
            <ChevronLeftIcon className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage((p) => p + 1)}
            aria-label="Berikutnya"
          >
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>
    </LiquidGlass>
  )
}
