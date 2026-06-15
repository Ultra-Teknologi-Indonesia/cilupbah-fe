"use client"

import {
  MoreHorizontalIcon,
  PencilIcon,
  EyeIcon,
  CopyIcon,
  ArchiveIcon,
  ArchiveRestoreIcon,
  CheckCircle2Icon,
  SendIcon,
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
import type { Product } from "@/types/master-produk"

export function ProductRowActions({ product }: { product: Product }) {
  const notify = (msg: string) => toast(msg, { description: product.itemName })

  return (
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

        {product.status === "in_review" ? (
          <>
            <DropdownMenuItem onClick={() => notify("Produk disetujui")}>
              <CheckCircle2Icon className="size-4 text-muted-foreground" />
              Setujui
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => notify("Produk ditolak")}>
              <Trash2Icon className="size-4 text-muted-foreground" />
              Tolak
            </DropdownMenuItem>
          </>
        ) : product.status === "download" ? (
          <DropdownMenuItem onClick={() => notify("Diajukan untuk review")}>
            <SendIcon className="size-4 text-muted-foreground" />
            Ajukan review
          </DropdownMenuItem>
        ) : null}

        {product.status === "archived" ? (
          <DropdownMenuItem onClick={() => notify("Produk dipulihkan")}>
            <ArchiveRestoreIcon className="size-4 text-muted-foreground" />
            Pulihkan
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => notify("Produk diarsipkan")}>
            <ArchiveIcon className="size-4 text-muted-foreground" />
            Arsipkan
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={() => notify("Produk dihapus")}
        >
          <Trash2Icon className="size-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
