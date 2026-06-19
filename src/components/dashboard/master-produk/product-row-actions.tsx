"use client"

import * as React from "react"
import {
  MoreHorizontalIcon,
  PencilIcon,
  EyeIcon,
  CopyIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Textarea } from "@/components/ui/textarea"
import { useDeleteProduct, useArchiveProduct } from "@/hooks/master-produk/use-product-actions"
import { useRestoreProduct } from "@/hooks/master-produk/use-archived-products"
import type { Product } from "@/types/master-produk"

export function ProductRowActions({ product }: { product: Product }) {
  const [archiveOpen, setArchiveOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [archiveReason, setArchiveReason] = React.useState("")

  const deleteMut = useDeleteProduct()
  const archiveMut = useArchiveProduct()
  const restoreMut = useRestoreProduct()

  const notify = (msg: string) => toast(msg, { description: product.itemName })

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">Buka menu</span>
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => notify("Membuka detail")}>
            <EyeIcon className="size-4 text-muted-foreground" />
            Lihat detail
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => notify("Mengedit produk")}>
            <PencilIcon className="size-4 text-muted-foreground" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard?.writeText(product.itemGroupId)
              notify(`ID disalin: ${product.itemGroupId}`)
            }}
          >
            <CopyIcon className="size-4 text-muted-foreground" />
            Salin ID
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {product.status === "archived" ? (
            <DropdownMenuItem
              disabled={restoreMut.isPending}
              onClick={() => restoreMut.mutate(product.itemGroupId)}
            >
              <ArchiveRestoreIcon className="size-4 text-muted-foreground" />
              Pulihkan
            </DropdownMenuItem>
          ) : product.status === "master" ? (
            <DropdownMenuItem onClick={() => {
              setArchiveReason("")
              setArchiveOpen(true)
            }}>
              <ArchiveIcon className="size-4 text-muted-foreground" />
              Arsipkan
            </DropdownMenuItem>
          ) : null}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2Icon className="size-4" />
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Arsipkan Produk"
        description={`"${product.itemName}" akan dipindahkan ke arsip dan tidak lagi aktif.`}
        confirmLabel="Arsipkan"
        loading={archiveMut.isPending}
        onConfirm={() => {
          archiveMut.mutate(
            { id: product.itemGroupId, reason: archiveReason || undefined },
            { onSuccess: () => setArchiveOpen(false) }
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
        description={`"${product.itemName}" akan dihapus permanen. Produk dengan stok tidak bisa dihapus.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={() => {
          deleteMut.mutate(product.itemGroupId, {
            onSuccess: () => setDeleteOpen(false),
          })
        }}
      />
    </>
  )
}
