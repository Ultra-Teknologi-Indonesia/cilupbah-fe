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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAssignPicker, usePickers } from "@/hooks/proses-pesanan/use-fulfillment"

interface UbahPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  picklistId: string | null
  picklistNo: string | null
  locationId: string | null
  currentPickerId: string | null
}

export function UbahPickerDialog(props: UbahPickerDialogProps) {
  // Remount internal body setiap dialog dibuka pada picklist berbeda — bikin state
  // initial value selalu mencerminkan currentPickerId terbaru tanpa setState-in-effect.
  return (
    <UbahPickerDialogInner
      key={props.open ? `open:${props.picklistId ?? "-"}` : "closed"}
      {...props}
    />
  )
}

function UbahPickerDialogInner({
  open,
  onOpenChange,
  picklistId,
  picklistNo,
  locationId,
  currentPickerId,
}: UbahPickerDialogProps) {
  const [pickerId, setPickerId] = React.useState(currentPickerId ?? "")

  const pickers = usePickers(locationId ?? undefined, open)
  const assignPicker = useAssignPicker()

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
            <Select
              value={pickerId || undefined}
              onValueChange={(v) => setPickerId(v)}
              disabled={pickers.isLoading}
            >
              <SelectTrigger
                id="assign-picker"
                className="w-full justify-between rounded-lg border-border bg-background"
              >
                <SelectValue placeholder="— Pilih picker —" />
              </SelectTrigger>
              <SelectContent position="popper" align="start" className="w-[var(--radix-select-trigger-width)]">
                {(pickers.data ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
