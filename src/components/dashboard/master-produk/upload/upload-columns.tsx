"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ImageIcon, PackageIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import type {
  ProductType,
  UploadableProduct,
} from "@/services/master-produk/upload.service"
import { formatIDR } from "../product-columns"

const TYPE_LABEL: Record<ProductType, string> = {
  single: "Satuan",
  variant: "Varian",
  bundle: "Bundle",
}

function priceLabel(min: number | null, max: number | null) {
  if (min === null && max === null) return "—"
  if (min === max || max === null) return formatIDR(min)
  if (min === null) return formatIDR(max)
  return `${formatIDR(min)} – ${formatIDR(max)}`
}

export const uploadColumns: ColumnDef<UploadableProduct>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Pilih semua"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
        aria-label="Pilih baris"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 36,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produk" />
    ),
    cell: ({ row }) => {
      const p = row.original
      return (
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
            {p.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={p.image}
                alt={p.name}
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-medium">{p.name}</span>
              {p.isBundle && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  Bundle
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{p.sku ?? "—"}</span>
              {p.totalVariants > 1 && (
                <span className="inline-flex items-center gap-1">
                  <PackageIcon className="size-3" />
                  {p.totalVariants} varian
                </span>
              )}
            </div>
          </div>
        </div>
      )
    },
  },
  {
    id: "type",
    header: "Tipe",
    enableSorting: false,
    cell: ({ row }) => (
      <Badge variant="outline" className="font-normal">
        {TYPE_LABEL[row.original.productType]}
      </Badge>
    ),
  },
  {
    accessorKey: "categoryName",
    header: "Kategori",
    enableSorting: false,
    cell: ({ row }) => <span className="text-sm">{row.original.categoryName}</span>,
  },
  {
    accessorKey: "brandName",
    header: "Merek",
    enableSorting: false,
    cell: ({ row }) => <span className="text-sm">{row.original.brandName}</span>,
  },
  {
    id: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga" className="justify-end" />
    ),
    enableSorting: false,
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {priceLabel(row.original.priceMin, row.original.priceMax)}
      </div>
    ),
  },
]
