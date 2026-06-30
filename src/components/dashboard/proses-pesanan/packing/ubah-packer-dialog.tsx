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
import { useAssignPacker, usePickers } from "@/hooks/proses-pesanan/use-fulfillment"

interface UbahPackerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  packlistId: string | null
  packlistNo: string | null
  locationId: string | null
  currentPackerId: string | null
}

export function UbahPackerDialog({
  open,
  onOpenChange,
  packlistId,
  packlistNo,
  locationId,
  currentPackerId,
}: UbahPackerDialogProps) {
  const [packerId, setPackerId] = React.useState("")

  const pickers = usePickers(locationId ?? undefined, "packer", open)
  const assignPacker = useAssignPacker()

  React.useEffect(() => {
    if (open) setPackerId(currentPackerId ?? "")
  }, [open, currentPackerId])

  const handleSubmit = async () => {
    if (!packlistId || !packerId) return
    try {
      await assignPacker.mutateAsync({ packlistId, packerId })
      toast.success(`Packer untuk ${packlistNo ?? "packlist"} diperbarui.`)
      onOpenChange(false)
    } catch (err) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Gagal mengubah packer."
      toast.error(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ubah Packer</DialogTitle>
          <DialogClose />
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {packlistNo && (
            <div className="rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-sm">
              Packlist <span className="font-medium">{packlistNo}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="assign-packer">Packer</Label>
            <select
              id="assign-packer"
              value={packerId}
              onChange={(e) => setPackerId(e.target.value)}
              className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="">— Pilih packer —</option>
              {pickers.data?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {pickers.isLoading && (
              <p className="text-xs text-muted-foreground">Memuat daftar packer…</p>
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
            disabled={!packerId || assignPacker.isPending}
          >
            {assignPacker.isPending && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
