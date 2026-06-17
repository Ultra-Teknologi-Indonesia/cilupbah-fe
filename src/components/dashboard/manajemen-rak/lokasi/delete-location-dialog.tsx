"use client"

import { Loader2Icon } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Location } from "@/types/pengaturan/location"

interface DeleteLocationDialogProps {
  location: Location | null
  open: boolean
  loading: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function DeleteLocationDialog({
  location,
  open,
  loading,
  onOpenChange,
  onConfirm,
}: DeleteLocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={!loading}>
        <DialogHeader>
          <DialogTitle>Hapus lokasi</DialogTitle>
          <DialogDescription>
            Yakin ingin menghapus lokasi{" "}
            <span className="font-medium text-foreground">
              {location?.locationName}
            </span>
            ? Tindakan ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2Icon className="animate-spin" />}
            Hapus
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
