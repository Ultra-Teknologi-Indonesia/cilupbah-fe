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
import { Checkbox } from "@/components/ui/checkbox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useOrdersByStage, useReadyToShip } from "@/hooks/proses-pesanan/use-fulfillment"
import { PICKING_ORDER_STAGE, type FulfillmentOrder } from "@/types/proses-pesanan/fulfillment"

import { ChannelBadge, OrderStatusBadge } from "../channel-badge"
import { BuatPicklistDialog } from "./buat-picklist-dialog"
import { DocActions } from "./doc-actions"

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

export function PickingOrdersTable({ sub }: { sub: "belum" | "selesai" }) {
  const stage = sub === "belum" ? PICKING_ORDER_STAGE.belum : PICKING_ORDER_STAGE.selesai

  const [search, setSearch] = React.useState("")
  const [debounced, setDebounced] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [picklistOpen, setPicklistOpen] = React.useState(false)

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const params = React.useMemo(
    () => ({ q: debounced || undefined, page, per_page: 20 }),
    [debounced, page]
  )
  const { data, isLoading, isFetching, refetch } = useOrdersByStage(stage, params)
  const readyToShip = useReadyToShip()

  const orders = data?.items ?? []
  const meta = data?.meta ?? { current_page: 1, last_page: 1, per_page: 20, total: 0 }

  const pageIds = orders.map((o) => o.id)
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id))
  const someSelected = pageIds.some((id) => selected.has(id))
  const selectedIds = React.useMemo(() => Array.from(selected), [selected])

  const clearSelection = () => setSelected(new Set())

  const toggleAll = () => {
    if (allSelected) clearSelection()
    else setSelected(new Set(pageIds))
  }
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  // Lokasi untuk Buat Picklist (harus satu lokasi).
  const selectedOrders = orders.filter((o) => selected.has(o.id))
  const distinctLocations = Array.from(
    new Set(selectedOrders.map((o) => o.locationId).filter(Boolean))
  )
  const picklistLocationId = distinctLocations[0] ?? null
  const picklistLocationName =
    selectedOrders.find((o) => o.locationId === picklistLocationId)?.locationName ?? null

  const handleShip = async (ids: string[]) => {
    if (!ids.length) return
    try {
      const results = await readyToShip.mutateAsync(ids)
      const ok = results.filter((r) => r.status === "success").length
      const failed = results.filter((r) => r.status === "failed")
      const skipped = results.filter((r) => r.status === "skipped").length
      if (failed.length) {
        toast.error(
          `${ok} berhasil, ${failed.length} gagal${skipped ? `, ${skipped} dilewati` : ""}.` +
            (failed[0].message ? ` (${failed[0].message})` : "")
        )
      } else {
        toast.success(
          `${ok} pesanan diteruskan "Siap Dikirim"${skipped ? `, ${skipped} dilewati` : ""}.`
        )
      }
      clearSelection()
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal memproses Siap Dikirim."
      toast.error(msg)
    }
  }

  const rowMenu = (o: FulfillmentOrder) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Aksi">
          <MoreHorizontalIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        {sub === "selesai" && (
          <>
            <DropdownMenuItem onSelect={() => DocActions.invoice([o.id])}>
              Cetak Faktur
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => DocActions.invoiceAndLabel([o.id])}>
              Cetak Faktur & Label
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => DocActions.suratJalanAndInvoice([o.id])}>
              Surat Jalan + Faktur
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onSelect={() => DocActions.shippingLabel([o.id])}>
          Cetak Label Pengiriman
        </DropdownMenuItem>
        {sub === "belum" && (
          <DropdownMenuItem onSelect={() => DocActions.pickList([o.id])}>
            Cetak Picklist
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => handleShip([o.id])}>Siap Dikirim</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
        <div className="relative w-full max-w-xs">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Cari no. pesanan…"
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

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-y border-primary/20 bg-primary/5 px-4 py-2.5 sm:px-5">
          <span className="mr-1 text-sm font-medium">{selected.size} pesanan dipilih</span>
          {sub === "belum" ? (
            <>
              <Button size="sm" variant="primary" onClick={() => setPicklistOpen(true)}>
                Buat Picklist
              </Button>
              <Button size="sm" variant="outline" onClick={() => DocActions.shippingLabel(selectedIds)}>
                Cetak Label
              </Button>
              <Button size="sm" variant="outline" onClick={() => DocActions.pickList(selectedIds)}>
                Cetak Picklist
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={() => DocActions.invoice(selectedIds)}>
                Cetak Faktur
              </Button>
              <Button size="sm" variant="outline" onClick={() => DocActions.shippingLabel(selectedIds)}>
                Cetak Label
              </Button>
              <Button size="sm" variant="outline" onClick={() => DocActions.invoiceAndLabel(selectedIds)}>
                Faktur & Label
              </Button>
              <Button size="sm" variant="outline" onClick={() => DocActions.suratJalanAndInvoice(selectedIds)}>
                Surat Jalan + Faktur
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="primary"
            onClick={() => handleShip(selectedIds)}
            disabled={readyToShip.isPending}
          >
            {readyToShip.isPending && <Loader2Icon className="animate-spin" />}
            Siap Dikirim
          </Button>
          <Button size="sm" variant="ghost" onClick={clearSelection} className="ml-auto">
            Batal
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
              <th className="w-10 px-3 py-3">
                <Checkbox
                  checked={allSelected ? true : someSelected ? "indeterminate" : false}
                  onCheckedChange={toggleAll}
                />
              </th>
              <th className="px-3 py-3 font-medium">No. Pesanan</th>
              <th className="px-3 py-3 font-medium">Tgl. Pesanan</th>
              <th className="px-3 py-3 font-medium">Channel</th>
              <th className="px-3 py-3 font-medium">Pelanggan</th>
              <th className="px-3 py-3 font-medium">Lokasi</th>
              <th className="px-3 py-3 font-medium">Kurir</th>
              <th className="px-3 py-3 font-medium">No. Resi</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="w-12 px-3 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-muted-foreground">
                  <Loader2Icon className="mx-auto size-5 animate-spin" />
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-16 text-center text-sm text-muted-foreground">
                  Tidak ada pesanan.
                </td>
              </tr>
            ) : (
              orders.map((o) => {
                const isSelected = selected.has(o.id)
                return (
                  <tr
                    key={o.id}
                    className={cn(
                      "border-b border-border/60 last:border-0",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    <td className="px-3 py-2.5">
                      <Checkbox checked={isSelected} onCheckedChange={() => toggleOne(o.id)} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-foreground">{o.salesorderNo}</div>
                      {o.channelOrderNo && (
                        <div className="text-xs text-muted-foreground">{o.channelOrderNo}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">
                      {formatDate(o.transactionDate)}
                    </td>
                    <td className="px-3 py-2.5">
                      <ChannelBadge source={o.source} />
                    </td>
                    <td className="px-3 py-2.5">{o.customerName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{o.locationName ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{o.shippingProvider ?? "—"}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{o.trackingNumber ?? "—"}</td>
                    <td className="px-3 py-2.5">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-3 py-2.5 text-right">{rowMenu(o)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

      <BuatPicklistDialog
        open={picklistOpen}
        onOpenChange={setPicklistOpen}
        orderIds={selectedIds}
        locationId={picklistLocationId}
        locationName={picklistLocationName}
        multiLocation={distinctLocations.length > 1}
        onCreated={clearSelection}
      />
    </LiquidGlass>
  )
}
