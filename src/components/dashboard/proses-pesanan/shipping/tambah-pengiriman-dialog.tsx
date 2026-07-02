"use client"

import * as React from "react"
import { format } from "date-fns"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateTimePicker } from "@/components/ui/date-picker"
import { useCouriers, useCreateShipment } from "@/hooks/proses-pesanan/use-fulfillment"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { SHIPMENT_TYPES, type ShipmentType } from "@/types/proses-pesanan/fulfillment"

interface TambahPengirimanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TambahPengirimanDialog({
  open,
  onOpenChange,
}: TambahPengirimanDialogProps) {
  const [shipmentNo, setShipmentNo] = React.useState("")
  const [courierId, setCourierId] = React.useState("")
  const [locationId, setLocationId] = React.useState("")
  const [shipmentType, setShipmentType] = React.useState<ShipmentType>("REGULAR")
  const [shipmentDate, setShipmentDate] = React.useState<Date | undefined>(
    () => new Date()
  )
  const [dateError, setDateError] = React.useState("")

  const couriers = useCouriers(open)
  const { data: locData } = useLocations({ perPage: 100 })
  const locations = locData?.items ?? []
  const createShipment = useCreateShipment()

  React.useEffect(() => {
    if (open) {
      setShipmentNo("")
      setCourierId("")
      setLocationId("")
      setShipmentType("REGULAR")
      setShipmentDate(new Date())
      setDateError("")
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

  const handleDateChange = (date: Date | undefined) => {
    setShipmentDate(date)
    if (date && date < new Date()) {
      setDateError("Tanggal & jam tidak boleh di masa lalu.")
    } else {
      setDateError("")
    }
  }

  const canSubmit =
    !!courierId && !!locationId && !!shipmentDate && !dateError

  const handleSubmit = async () => {
    if (!selectedCourier || !locationId || !shipmentDate) return

    if (shipmentDate < new Date()) {
      setDateError("Tanggal & jam tidak boleh di masa lalu.")
      return
    }

    try {
      await createShipment.mutateAsync({
        payload: {
          shipment_no: shipmentNo.trim() || null,
          location_id: locationId,
          courier_name: selectedCourier.name,
          courier_code: selectedCourier.code,
          shipment_type: shipmentType,
          shipment_date: format(shipmentDate, "yyyy-MM-dd HH:mm:ss"),
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
          <DialogTitle>Buat Pengiriman</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="new-shipment-no">No. Pengiriman</Label>
            <Input
              id="new-shipment-no"
              value={shipmentNo}
              onChange={(e) => setShipmentNo(e.target.value)}
              placeholder="Kosongkan untuk auto-generate"
            />
          </div>

          <div className="space-y-1.5">
            <Label>
              Kurir<span className="text-destructive"> *</span>
            </Label>
            <Select value={courierId} onValueChange={handleCourierChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Kurir" />
              </SelectTrigger>
              <SelectContent>
                {couriers.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                    {c.type ? ` (${c.type})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {couriers.isLoading && (
              <p className="text-xs text-muted-foreground">Memuat daftar kurir…</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>
              Lokasi<span className="text-destructive"> *</span>
            </Label>
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih Lokasi" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.locationName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>
              Tanggal Pengiriman<span className="text-destructive"> *</span>
            </Label>
            <DateTimePicker
              value={shipmentDate}
              onChange={handleDateChange}
              disablePast
              placeholder="Pilih tanggal & jam"
            />
            {dateError && (
              <p className="text-xs text-destructive">{dateError}</p>
            )}
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
