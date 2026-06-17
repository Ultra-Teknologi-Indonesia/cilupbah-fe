"use client"

import * as React from "react"
import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { ChevronRightIcon, ImageIcon, PackageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import type { Product } from "@/types/master-produk"
import { ProductStatusBadge } from "./product-status-badge"
import { ProductChannelBadges } from "./product-channel-badges"
import { ProductRowActions } from "./product-row-actions"

export const formatIDR = (value: number | null) =>
  value === null
    ? "—"
    : new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }).format(value)

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))

export const productColumns: ColumnDef<Product>[] = [
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
    accessorKey: "itemName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Produk" />
    ),
    cell: ({ row }) => {
      const p = row.original
      const canExpand = p.variants.length > 1
      return (
        <div className="flex items-center gap-3">
          {canExpand ? (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation()
                row.toggleExpanded()
              }}
              aria-label="Lihat varian"
            >
              <ChevronRightIcon
                className={cn(
                  "size-4 transition-transform",
                  row.getIsExpanded() && "rotate-90"
                )}
              />
            </Button>
          ) : (
            <span className="inline-block w-6" />
          )}

          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
            {p.thumbnail ? (

              <img
                src={p.thumbnail}
                alt={p.itemName}
                className="size-full object-cover"
              />
            ) : (
              <ImageIcon className="size-4 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/dashboard/master-produk/${p.itemGroupId}`}
                prefetch={false}
                className="truncate font-medium hover:text-primary hover:underline"
              >
                {p.itemName}
              </Link>
              {p.isBundle && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                  Bundle
                </Badge>
              )}
              {p.isPo && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  PO
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">{p.sku ?? "—"}</span>
              <span className="inline-flex items-center gap-1">
                <PackageIcon className="size-3" />
                {p.totalVariants} varian
              </span>
            </div>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "categoryName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kategori" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.categoryName}</span>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id) as string),
  },
  {
    accessorKey: "brandName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Merek" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.brandName}</span>
    ),
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id) as string),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
    filterFn: (row, id, value: string[]) =>
      value.includes(row.getValue(id) as string),
  },
  {
    accessorKey: "sellPrice",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Harga" className="justify-end" />
    ),
    cell: ({ row }) => (
      <div className="text-right font-medium tabular-nums">
        {formatIDR(row.original.sellPrice)}
      </div>
    ),
  },
  {
    id: "channels",
    header: "Channel",
    enableSorting: false,
    cell: ({ row }) => (
      <ProductChannelBadges channels={row.original.onlineStatus} max={5} />
    ),
  },
  {
    accessorKey: "lastModified",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Diperbarui" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(row.original.lastModified)}
      </span>
    ),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <div className="text-right">
        <ProductRowActions product={row.original} />
      </div>
    ),
    size: 48,
  },
]

export const productColumnLabels: Record<string, string> = {
  itemName: "Produk",
  categoryName: "Kategori",
  brandName: "Merek",
  status: "Status",
  sellPrice: "Harga",
  channels: "Channel",
  lastModified: "Diperbarui",
}
