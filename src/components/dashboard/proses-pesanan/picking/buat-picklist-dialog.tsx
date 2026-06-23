"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { useCreatePicklist, usePickers } from "@/hooks/proses-pesanan/use-fulfillment"

interface BuatPicklistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderIds: string[]
  locationId: string | null
  locationName: string | null
  multiLocation: boolean
  onCreated: () => void
}

export function BuatPicklistDialog({
  open,
  onOpenChange,
  orderIds,
  locationId,
  locationName,
  multiLocation,
  onCreated,
}: BuatPicklistDialogProps) {
  const [pickerId, setPickerId] = React.useState("")
  const [notes, setNotes] = React.useState("")

  const pickers = usePickers(locationId ?? undefined, open && !!locationId)
  const createPicklist = useCreatePicklist()

  React.useEffect(() => {
    if (open) {
      setPickerId("")
      setNotes("")
    }
  }, [open])

  const canSubmit = orderIds.length > 0 && !!locationId && !multiLocation

  const handleSubmit = async () => {
    if (!locationId) return
    try {
      await createPicklist.mutateAsync({
        order_ids: orderIds,
        location_id: locationId,
        picker_id: pickerId || null,
        notes: notes || null,
      })
      toast.success(`Picklist dibuat untuk ${orderIds.length} pesanan.`)
      onOpenChange(false)
      onCreated()
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal membuat picklist."
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buat Picklist</DialogTitle>
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
            <Label htmlFor="picklist-picker">Picker (opsional)</Label>
            <select
              id="picklist-picker"
              value={pickerId}
              onChange={(e) => setPickerId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">— Tanpa picker —</option>
              {pickers.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {pickers.isLoading && (
              <p className="text-xs text-muted-foreground">Memuat daftar picker…</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="picklist-notes">Catatan (opsional)</Label>
            <textarea
              id="picklist-notes"
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
            disabled={!canSubmit || createPicklist.isPending}
          >
            {createPicklist.isPending && <Loader2Icon className="animate-spin" />}
            Buat Picklist
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
