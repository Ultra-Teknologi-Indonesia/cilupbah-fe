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
import { useUpdateKategori } from "@/hooks/kategori-merek/use-kategori"

interface EditKategoriDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: number | null
  currentName: string
  fullPath: string
}

export function EditKategoriDialog({
  open,
  onOpenChange,
  categoryId,
  currentName,
  fullPath,
}: EditKategoriDialogProps) {
  const [name, setName] = React.useState(currentName)
  const updateMut = useUpdateKategori()

  React.useEffect(() => {
    if (open) setName(currentName)
  }, [open, currentName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || !categoryId) return
    if (trimmed === currentName) {
      onOpenChange(false)
      return
    }

    updateMut.mutate(
      { id: categoryId, name: trimmed },
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
              <DialogTitle className="text-lg">Edit Kategori</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {fullPath}
              </DialogDescription>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon-sm" aria-label="Tutup">
                <XIcon className="size-4" />
              </Button>
            </DialogClose>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-2 px-5 py-4 sm:px-6">
              <Label htmlFor="edit-kategori-name">Nama Kategori</Label>
              <Input
                id="edit-kategori-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama kategori"
                autoFocus
              />
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
                {updateMut.isPending && (
                  <Loader2Icon className="animate-spin" />
                )}
                Simpan
              </Button>
            </div>
          </form>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
