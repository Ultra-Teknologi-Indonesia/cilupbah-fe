"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface PriceEditData {
  variantId: string
  productName: string
  sku: string
  targetId: string
  targetName: string
  currentPrice: number
}

export function PriceEditModal({
  open,
  onOpenChange,
  data,
  isPending,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: PriceEditData | null
  isPending: boolean
  onSave: (variantId: string, targetId: string, price: number) => void
}) {
  const [price, setPrice] = React.useState("")

  React.useEffect(() => {
    if (data) {
      setPrice(String(data.currentPrice || ""))
    }
  }, [data])

  if (!data) return null

  const handleSave = () => {
    const numPrice = Number(price)
    if (Number.isNaN(numPrice) || numPrice < 0) return
    onSave(data.variantId, data.targetId, numPrice)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Harga</DialogTitle>
          <DialogDescription>
            {data.productName} — {data.sku}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Toko/Lokasi:</span>{" "}
            <span className="font-medium">{data.targetName}</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-price">Harga Baru</Label>
            <Input
              id="edit-price"
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave()
              }}
              autoFocus
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isPending || !price}>
            {isPending && <Loader2Icon className="size-4 animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
