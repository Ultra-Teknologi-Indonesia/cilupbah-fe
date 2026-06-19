"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useCreateCategoryAttribute } from "@/hooks/kategori-merek/use-kategori"

interface TambahAtributDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryId: number
  type: "spec" | "sales"
}

export function TambahAtributDialog({
  open,
  onOpenChange,
  categoryId,
  type,
}: TambahAtributDialogProps) {
  const [name, setName] = React.useState("")
  const create = useCreateCategoryAttribute()

  const label = type === "spec" ? "Atribut" : "Variasi"

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    create.mutate(
      { categoryId, data: { name: name.trim(), type } },
      {
        onSuccess: () => {
          setName("")
          onOpenChange(false)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Tambah {label}</DialogTitle>
        <DialogDescription>
          Masukkan nama {label.toLowerCase()} baru untuk kategori ini.
        </DialogDescription>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="attr-name">Nama {label}</Label>
            <Input
              id="attr-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`Masukkan nama ${label.toLowerCase()}`}
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Batal
              </Button>
            </DialogClose>
            <Button
              type="submit"
              variant="primary"
              disabled={!name.trim() || create.isPending}
            >
              {create.isPending && <Loader2Icon className="size-4 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
