"use client"

import * as React from "react"
import { Loader2Icon, ScanBarcodeIcon, Trash2Icon, TruckIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  useShipmentDetail,
  useScanOrderToShipment,
  useRemoveOrderFromShipment,
  useHandOverShipment,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { ChannelBadge } from "../channel-badge"

function formatDate(iso: string | null): string {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
}

interface ShipmentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipmentId: string | null
}

export function ShipmentDetailDialog({
  open,
  onOpenChange,
  shipmentId,
}: ShipmentDetailDialogProps) {
  const [barcode, setBarcode] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { data: detail, isLoading } = useShipmentDetail(shipmentId ?? "", open && !!shipmentId)
  const scanOrder = useScanOrderToShipment()
  const removeOrder = useRemoveOrderFromShipment()
  const handOver = useHandOverShipment()

  React.useEffect(() => {
    if (open) {
      setBarcode("")
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleScan = async () => {
    const code = barcode.trim()
    if (!code || !shipmentId) return

    try {
      await scanOrder.mutateAsync({ shipmentId, barcode: code })
      toast.success(`Pesanan ${code} ditambahkan.`)
      setBarcode("")
      inputRef.current?.focus()
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal menambahkan pesanan."
      toast.error(msg)
      setBarcode("")
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleScan()
    }
  }

  const handleRemove = async (orderId: string, orderNo: string | null) => {
    if (!shipmentId) return
    if (!window.confirm(`Hapus pesanan ${orderNo ?? orderId} dari pengiriman ini?`)) return

    try {
      await removeOrder.mutateAsync({ shipmentId, orderIds: [orderId] })
      toast.success(`Pesanan ${orderNo ?? ""} dihapus dari pengiriman.`)
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal menghapus pesanan."
      toast.error(msg)
    }
  }

  const handleHandOver = () => {
    if (!shipmentId || !detail) return
    if (detail.orders.length === 0) {
      toast.error("Tidak ada pesanan dalam pengiriman ini.")
      return
    }
    if (!window.confirm(`Serahkan ${detail.shipmentNo} (${detail.orders.length} pesanan) ke kurir?`))
      return

    handOver.mutate(shipmentId, {
      onSuccess: () => {
        toast.success(`${detail.shipmentNo} diserahkan ke kurir.`)
        onOpenChange(false)
      },
      onError: (e) => {
        const msg =
          e && typeof e === "object" && "message" in e
            ? String((e as { message?: unknown }).message)
            : "Gagal serah terima."
        toast.error(msg)
      },
    })
  }

  const isScheduled = detail?.status === "SCHEDULED"
  const withResi = detail?.orders.filter((o) => !!o.trackingNumber).length ?? 0
  const withoutResi = (detail?.orders.length ?? 0) - withResi

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TruckIcon className="size-5" />
            {detail?.shipmentNo ?? "Pengiriman"}
          </DialogTitle>
          <DialogClose />
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : detail ? (
          <div className="flex flex-col gap-4 overflow-hidden">
            {/* Header info */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-xs text-muted-foreground">Kurir</p>
                <p className="text-sm font-medium">{detail.courierName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Pesanan</p>
                <p className="text-sm font-medium tabular-nums">{detail.orders.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dengan Resi</p>
                <p className="text-sm font-medium tabular-nums">{withResi}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Tanpa Resi</p>
                <p className="text-sm font-medium tabular-nums">{withoutResi}</p>
              </div>
            </div>

            {/* Scan input */}
            {isScheduled && (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ScanBarcodeIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={inputRef}
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scan No. Pesanan / No. Resi…"
                    className="pl-9"
                    disabled={scanOrder.isPending}
                  />
                </div>
                <Button
                  variant="primary"
                  onClick={handleScan}
                  disabled={!barcode.trim() || scanOrder.isPending}
                >
                  {scanOrder.isPending ? (
                    <Loader2Icon className="size-4 animate-spin" />
                  ) : (
                    "Tambah"
                  )}
                </Button>
              </div>
            )}

            {/* Orders table */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Daftar Pesanan
              </p>
              <Badge>{detail.orders.length}</Badge>
            </div>

            <div className="overflow-auto flex-1 -mx-1 px-1" style={{ maxHeight: "40vh" }}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>No. Pesanan</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>No. Resi</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    {isScheduled && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.orders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={isScheduled ? 5 : 4}
                        className="py-12 text-center text-sm text-muted-foreground"
                      >
                        Belum ada pesanan. Scan untuk menambahkan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    detail.orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            {o.source && <ChannelBadge source={o.source} />}
                            <span className="font-medium text-foreground text-xs">
                              {o.orderNo ?? "—"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          {o.customerName ?? "—"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "text-xs tabular-nums",
                              o.trackingNumber
                                ? "text-foreground"
                                : "text-muted-foreground italic"
                            )}
                          >
                            {o.trackingNumber ?? "Belum ada"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs tabular-nums">
                          {o.grandTotal.toLocaleString("id-ID")}
                        </TableCell>
                        {isScheduled && (
                          <TableCell>
                            <button
                              type="button"
                              onClick={() => handleRemove(o.orderId, o.orderNo)}
                              disabled={removeOrder.isPending}
                              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                              aria-label="Hapus"
                            >
                              <Trash2Icon className="size-3.5" />
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Footer actions */}
            {isScheduled && (
              <div className="flex justify-between items-center border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">
                  {detail.notes ? `Catatan: ${detail.notes}` : ""}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Tutup
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleHandOver}
                    disabled={detail.orders.length === 0 || handOver.isPending}
                  >
                    {handOver.isPending && <Loader2Icon className="size-4 animate-spin" />}
                    Serah Terima
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
