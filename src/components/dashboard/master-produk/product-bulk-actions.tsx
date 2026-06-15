"use client"

import type { Table } from "@tanstack/react-table"
import { ArchiveIcon, DownloadIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import type { Product } from "@/types/master-produk"

export function ProductBulkActions({
  selected,
  table,
}: {
  selected: Product[]
  table: Table<Product>
}) {
  const run = (label: string) => {
    toast(label, { description: `${selected.length} produk` })
    table.resetRowSelection()
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => run("Mengekspor produk terpilih")}
      >
        <DownloadIcon className="size-4" />
        Ekspor
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => run("Mengarsipkan produk terpilih")}
      >
        <ArchiveIcon className="size-4" />
        Arsipkan
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => run("Menghapus produk terpilih")}
      >
        <Trash2Icon className="size-4" />
        Hapus
      </Button>
    </>
  )
}
