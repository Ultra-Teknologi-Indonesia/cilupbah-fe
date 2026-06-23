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
import { useAssignPicker, usePickers } from "@/hooks/proses-pesanan/use-fulfillment"

interface UbahPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  picklistId: string | null
  picklistNo: string | null
  locationId: string | null
  currentPickerId: string | null
}

export function UbahPickerDialog({
  open,
  onOpenChange,
  picklistId,
  picklistNo,
  locationId,
  currentPickerId,
}: UbahPickerDialogProps) {
  const [pickerId, setPickerId] = React.useState("")

  const pickers = usePickers(locationId ?? undefined, open)
  const assignPicker = useAssignPicker()

  React.useEffect(() => {
    if (open) setPickerId(currentPickerId ?? "")
  }, [open, currentPickerId])

  const handleSubmit = async () => {
    if (!picklistId || !pickerId) return
    try {
      await assignPicker.mutateAsync({ picklistId, pickerId })
      toast.success(`Picker untuk ${picklistNo ?? "picklist"} diperbarui.`)
      onOpenChange(false)
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal mengubah picker."
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Picker</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {picklistNo && (
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm">
              Picklist <span className="font-medium">{picklistNo}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="assign-picker">Picker</Label>
            <select
              id="assign-picker"
              value={pickerId}
              onChange={(e) => setPickerId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">— Pilih picker —</option>
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
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!pickerId || assignPicker.isPending}
          >
            {assignPicker.isPending && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
