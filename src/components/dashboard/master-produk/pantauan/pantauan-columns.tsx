"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { ImageIcon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import type {
  PantauanLens,
  PantauanProduct,
} from "@/services/master-produk/pantauan.service"

function produkCell(p: PantauanProduct) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
        {p.primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.primaryImage} alt={p.productName} className="size-full object-cover" />
        ) : (
          <ImageIcon className="size-4 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0">
        <Link
          href={`/dashboard/master-produk/${p.productId}`}
          prefetch={false}
          className="line-clamp-1 font-medium hover:text-primary hover:underline"
        >
          {p.productName}
        </Link>
        <div className="font-mono text-xs text-muted-foreground">{p.sku ?? "—"}</div>
      </div>
    </div>
  )
}

const LENS_BADGE: Record<Exclude<PantauanLens, "belum_upload" | "persyaratan">, { label: string; cls: string }> = {
  harga: { label: "Harga berbeda antar channel", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  sku: { label: "SKU berbeda dengan master", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  atribut: { label: "Atribut berbeda antar channel", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
}

export function buildPantauanColumns(lens: PantauanLens): ColumnDef<PantauanProduct>[] {
  const lensColumn: ColumnDef<PantauanProduct> =
    lens === "belum_upload"
      ? {
          id: "belum_upload",
          header: "Channel Belum Diupload",
          cell: ({ row }) => {
            const n = row.original.notUploadedCount
            return n && n > 0 ? (
              <span className="font-medium text-primary">{n} Channel</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          },
        }
      : lens === "persyaratan"
        ? {
            id: "persyaratan",
            header: "Persyaratan",
            cell: ({ row }) => {
              const summary = row.original.requirementsSummary
              return summary ? (
                <span className="rounded px-1.5 py-0.5 text-[11px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  {summary}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )
            },
          }
        : {
            id: "lens",
            header: "Keterangan",
            cell: () => {
              const b = LENS_BADGE[lens]
              return (
                <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
              )
            },
          }

  return [
    {
      id: "produk",
      header: "Produk",
      cell: ({ row }) => produkCell(row.original),
    },
    lensColumn,
    {
      id: "kategori",
      header: "Kategori",
      cell: ({ row }) => <span className="text-sm">{row.original.categoryName ?? "—"}</span>,
    },
    {
      id: "actions",
      header: "",
      enableHiding: false,
      cell: ({ row }) => (
        <div className="text-right">
          <Button variant="primary" size="sm" asChild>
            <Link href={`/dashboard/produk/${row.original.productId}/upload-to-channel`} prefetch={false}>
              <UploadIcon className="size-4" />
              Upload
            </Link>
          </Button>
        </div>
      ),
      size: 100,
    },
  ]
}
