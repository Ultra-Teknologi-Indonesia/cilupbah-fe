"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RawConnectedStore } from "@/types/channel"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  stores: RawConnectedStore[]
  existingStoreIds: string[]
  loading: boolean
  onSubmit: (shopId: string) => void
}

export function NaikkanTambahDialog({
  open,
  onOpenChange,
  stores,
  existingStoreIds,
  loading,
  onSubmit,
}: Props) {
  const [selectedShopId, setSelectedShopId] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) setSelectedShopId(null)
  }, [open])

  const options = stores
    .filter((s) => !existingStoreIds.includes(s.id))
    .map((s) => ({
      value: s.shop_id,
      label: s.shop_name,
    }))

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Naikkan Produk</DialogTitle>
          <DialogDescription>
            Pilih toko Shopee untuk menambahkan data naikkan produk.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <Combobox
            options={options}
            value={selectedShopId}
            onChange={setSelectedShopId}
            placeholder="Pilih toko Shopee..."
            searchPlaceholder="Cari toko..."
            className="w-full"
          />

          {options.length === 0 && (
            <p className="mt-2 text-sm text-muted-foreground">
              Semua toko Shopee sudah memiliki data naikkan, atau belum ada toko Shopee yang terhubung.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={() => selectedShopId && onSubmit(selectedShopId)}
            disabled={!selectedShopId || loading}
          >
            {loading && <Loader2Icon className="animate-spin" />}
            Simpan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
