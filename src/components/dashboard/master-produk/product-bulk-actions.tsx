"use client"

import * as React from "react"
import type { Table } from "@tanstack/react-table"
import { ArchiveIcon, DownloadIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useBulkArchive, useBulkDelete } from "@/hooks/master-produk/use-product-actions"
import type { Product } from "@/types/master-produk"

export function ProductBulkActions({
  selected,
  table,
}: {
  selected: Product[]
  table: Table<Product>
}) {
  const [archiveOpen, setArchiveOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [archiveReason, setArchiveReason] = React.useState("")

  const bulkArchive = useBulkArchive()
  const bulkDelete = useBulkDelete()

  const ids = selected.map((p) => p.itemGroupId)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          toast("Mengekspor produk terpilih", { description: `${selected.length} produk` })
          table.resetRowSelection()
        }}
      >
        <DownloadIcon className="size-4" />
        Ekspor
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setArchiveReason("")
          setArchiveOpen(true)
        }}
      >
        <ArchiveIcon className="size-4" />
        Arsipkan
      </Button>
      <Button
        variant="destructive"
        size="sm"
        onClick={() => setDeleteOpen(true)}
      >
        <Trash2Icon className="size-4" />
        Hapus
      </Button>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Arsipkan Produk"
        description={`${selected.length} produk akan dipindahkan ke arsip dan tidak lagi aktif.`}
        confirmLabel="Arsipkan"
        loading={bulkArchive.isPending}
        onConfirm={() => {
          bulkArchive.mutate(
            { ids, reason: archiveReason || undefined },
            {
              onSuccess: () => {
                setArchiveOpen(false)
                table.resetRowSelection()
              },
            }
          )
        }}
      >
        <div className="py-2">
          <Textarea
            value={archiveReason}
            onChange={(e) => setArchiveReason(e.target.value)}
            placeholder="Alasan arsip (opsional)..."
            rows={2}
          />
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Produk"
        description={`${selected.length} produk akan dihapus permanen. Produk dengan stok tidak bisa dihapus.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={bulkDelete.isPending}
        onConfirm={() => {
          bulkDelete.mutate(ids, {
            onSuccess: () => {
              setDeleteOpen(false)
              table.resetRowSelection()
            },
          })
        }}
      />
    </>
  )
}
