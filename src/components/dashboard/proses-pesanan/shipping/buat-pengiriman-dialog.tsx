"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { useCouriers, useCreateShipment } from "@/hooks/proses-pesanan/use-fulfillment"
import { SHIPMENT_TYPES, type ShipmentType } from "@/types/proses-pesanan/fulfillment"

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

interface BuatPengirimanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderIds: string[]
  locationId: string | null
  locationName: string | null
  multiLocation: boolean
  onCreated: () => void
}

export function BuatPengirimanDialog({
  open,
  onOpenChange,
  orderIds,
  locationId,
  locationName,
  multiLocation,
  onCreated,
}: BuatPengirimanDialogProps) {
  const [courierId, setCourierId] = React.useState("")
  const [shipmentType, setShipmentType] = React.useState<ShipmentType>("REGULAR")
  const [shipmentDate, setShipmentDate] = React.useState(today)
  const [notes, setNotes] = React.useState("")

  const couriers = useCouriers(open)
  const createShipment = useCreateShipment()

  React.useEffect(() => {
    if (open) {
      setCourierId("")
      setShipmentType("REGULAR")
      setShipmentDate(today())
      setNotes("")
    }
  }, [open])

  const selectedCourier = couriers.data?.find((c) => c.id === courierId) ?? null

  const handleCourierChange = (id: string) => {
    setCourierId(id)
    const c = couriers.data?.find((x) => x.id === id)
    if (c?.type && SHIPMENT_TYPES.some((t) => t.value === c.type)) {
      setShipmentType(c.type as ShipmentType)
    }
  }

  const canSubmit = orderIds.length > 0 && !!locationId && !multiLocation && !!courierId

  const handleSubmit = async () => {
    if (!locationId || !selectedCourier) return
    try {
      await createShipment.mutateAsync({
        payload: {
          location_id: locationId,
          courier_name: selectedCourier.name,
          courier_code: selectedCourier.code,
          shipment_type: shipmentType,
          shipment_date: shipmentDate,
          notes: notes || null,
        },
        orderIds,
      })
      toast.success(`Pengiriman dibuat untuk ${orderIds.length} pesanan.`)
      onOpenChange(false)
      onCreated()
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal membuat pengiriman."
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Pengiriman</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm">
            <span className="font-medium">{orderIds.length}</span> pesanan terpilih
          </div>

          {multiLocation && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
              Pesanan terpilih berasal dari lokasi berbeda. Pilih pesanan dari satu lokasi saja.
            </p>
          )}

          <div className="space-y-1.5">
            <Label>Lokasi</Label>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm">
              {locationName ?? (locationId ? locationId : "—")}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shipment-courier">
              Kurir<span className="text-destructive"> *</span>
            </Label>
            <select
              id="shipment-courier"
              value={courierId}
              onChange={(e) => handleCourierChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">— Pilih kurir —</option>
              {couriers.data?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {c.type ? ` (${c.type})` : ""}
                </option>
              ))}
            </select>
            {couriers.isLoading && (
              <p className="text-xs text-muted-foreground">Memuat daftar kurir…</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="shipment-type">Tipe</Label>
              <select
                id="shipment-type"
                value={shipmentType}
                onChange={(e) => setShipmentType(e.target.value as ShipmentType)}
                className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {SHIPMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="shipment-date">Tgl. Pengiriman</Label>
              <Input
                id="shipment-date"
                type="date"
                value={shipmentDate}
                onChange={(e) => setShipmentDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shipment-notes">Catatan (opsional)</Label>
            <textarea
              id="shipment-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit || createShipment.isPending}
          >
            {createShipment.isPending && <Loader2Icon className="animate-spin" />}
            Buat Pengiriman
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
