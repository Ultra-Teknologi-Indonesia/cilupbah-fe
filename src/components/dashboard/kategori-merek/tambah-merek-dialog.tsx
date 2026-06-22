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
import { useCreateBrand } from "@/hooks/kategori-merek/use-brand"

interface TambahMerekDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TambahMerekDialog({
  open,
  onOpenChange,
}: TambahMerekDialogProps) {
  const [name, setName] = React.useState("")
  const createMut = useCreateBrand()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    createMut.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          setName("")
          onOpenChange(false)
        },
      },
    )
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setName("")
    onOpenChange(next)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={createMut.isPending ? undefined : handleOpenChange}
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
              <DialogTitle className="text-lg">Tambah Merek</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Buat merek baru untuk produk.
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
                <Label htmlFor="merek-name">Nama Merek</Label>
                <Input
                  id="merek-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Samsung, Apple, Xiaomi"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-4 sm:px-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={createMut.isPending}
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!name.trim() || createMut.isPending}
              >
                {createMut.isPending && <Loader2Icon className="animate-spin" />}
                Simpan
              </Button>
            </div>
          </form>
        </LiquidGlass>
      </DialogContent>
    </Dialog>
  )
}
