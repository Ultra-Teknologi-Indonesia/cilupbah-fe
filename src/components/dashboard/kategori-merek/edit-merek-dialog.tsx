"use client"

import * as React from "react"
import { Loader2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useUpdateBrand } from "@/hooks/kategori-merek/use-brand"

interface EditMerekDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandId: number | null
  currentName: string
}

export function EditMerekDialog({
  open,
  onOpenChange,
  brandId,
  currentName,
}: EditMerekDialogProps) {
  const [name, setName] = React.useState(currentName)
  const updateMut = useUpdateBrand()

  React.useEffect(() => {
    if (open) setName(currentName)
  }, [open, currentName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !brandId) return
    if (trimmed === currentName) {
      onOpenChange(false)
      return
    }
    updateMut.mutate(
      { id: brandId, name: trimmed },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={updateMut.isPending ? undefined : onOpenChange}
    >
      <DialogContent
        showCloseButton={false}
        className="border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-md"
      >
        <LiquidGlass
          radius={28}
          intensity="strong"
          className="bg-white/85 dark:bg-neutral-900/85"
        >
          <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
            <div>
              <DialogTitle className="text-lg">Edit Merek</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Ubah nama merek.
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Tutup">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-5 py-4 sm:px-6">
              <div className="space-y-2">
                <Label htmlFor="edit-merek-name">Nama Merek</Label>
                <Input
                  id="edit-merek-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama merek"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={updateMut.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!name.trim() || updateMut.isPending}
              >
                {updateMut.isPending && <Loader2Icon className="animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
