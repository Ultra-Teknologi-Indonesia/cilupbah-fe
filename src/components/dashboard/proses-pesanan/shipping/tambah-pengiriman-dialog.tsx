"use client"

import * as React from "react"
import { Loader2Icon, PlusIcon } from "lucide-react"
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
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { SHIPMENT_TYPES, type ShipmentType } from "@/types/proses-pesanan/fulfillment"

function nowDatetime(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

interface TambahPengirimanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TambahPengirimanDialog({
  open,
  onOpenChange,
}: TambahPengirimanDialogProps) {
  const [courierId, setCourierId] = React.useState("")
  const [locationId, setLocationId] = React.useState("")
  const [shipmentType, setShipmentType] = React.useState<ShipmentType>("REGULAR")
  const [shipmentDate, setShipmentDate] = React.useState(nowDatetime)

  const couriers = useCouriers(open)
  const { data: locData } = useLocations({ perPage: 100 })
  const locations = locData?.items ?? []
  const createShipment = useCreateShipment()

  React.useEffect(() => {
    if (open) {
      setCourierId("")
      setLocationId("")
      setShipmentType("REGULAR")
      setShipmentDate(nowDatetime())
    }
  }, [open])

  const selectedCourier = couriers.data?.find((c) => c.id === courierId) ?? null
  const selectedLocation = locations.find((l) => l.id === locationId) ?? null

  const handleCourierChange = (id: string) => {
    setCourierId(id)
    const c = couriers.data?.find((x) => x.id === id)
    if (c?.type && SHIPMENT_TYPES.some((t) => t.value === c.type)) {
      setShipmentType(c.type as ShipmentType)
    }
  }

  const canSubmit = !!courierId && !!locationId

  const handleSubmit = async () => {
    if (!selectedCourier || !locationId) return

    try {
      await createShipment.mutateAsync({
        payload: {
          location_id: locationId,
          courier_name: selectedCourier.name,
          courier_code: selectedCourier.code,
          shipment_type: shipmentType,
          shipment_date: shipmentDate,
          notes: null,
        },
        orderIds: [],
      })
      toast.success("Pengiriman baru berhasil dibuat.")
      onOpenChange(false)
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
          <DialogTitle>Tambah Pengiriman Baru</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-1.5">
            <Label>No. Pengiriman</Label>
            <div className="h-9 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              [auto]
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-shipment-courier">
              Kurir<span className="text-destructive"> *</span>
            </Label>
            <select
              id="new-shipment-courier"
              value={courierId}
              onChange={(e) => handleCourierChange(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">Pilih Kurir</option>
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

          <div className="space-y-1.5">
            <Label htmlFor="new-shipment-location">
              Lokasi<span className="text-destructive"> *</span>
            </Label>
            <select
              id="new-shipment-location"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">Pilih Lokasi</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.locationName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="new-shipment-date">
              Tanggal Pengiriman<span className="text-destructive"> *</span>
            </Label>
            <Input
              id="new-shipment-date"
              type="datetime-local"
              value={shipmentDate}
              onChange={(e) => setShipmentDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!canSubmit || createShipment.isPending}
          >
            {createShipment.isPending && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
