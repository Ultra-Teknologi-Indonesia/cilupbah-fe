"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { ExternalLinkIcon, ImageIcon, UploadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo"
import { SyncStatusBadge } from "../detail/tab-pagination"
import type {
  PantauanLens,
  PantauanProduct,
} from "@/services/master-produk/pantauan.service"
import type { ChannelCode } from "@/types/channel"

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
          href={`/dashboard/produk/${p.productId}`}
         
          className="line-clamp-1 font-medium hover:text-primary hover:underline"
        >
          {p.productName}
        </Link>
        <div className="font-mono text-xs text-foreground">{p.sku ?? "—"}</div>
      </div>
    </div>
  )
}

const LENS_BADGE: Record<string, { label: string; cls: string }> = {
  harga: { label: "Harga berbeda antar channel", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  sku: { label: "SKU berbeda dengan master", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  atribut: { label: "Atribut berbeda antar channel", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
}

function reviewChannelsCell(row: PantauanProduct, showReason: boolean) {
  const channels = row.reviewChannels
  if (!channels.length) return <span className="text-muted-foreground">—</span>
  return (
    <div className="flex flex-col gap-1.5">
      {channels.map((rc, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {rc.channelCode && (
            <ChannelLogo
              code={rc.channelCode as ChannelCode}
              name={rc.shopName ?? ""}
              className="size-5 rounded text-[9px]"
            />
          )}
          <span className="text-xs text-foreground">{rc.shopName}</span>
          <SyncStatusBadge status={rc.syncStatus} reason={rc.errorMessage} />
          {showReason && rc.errorMessage && (
            <span
              className="truncate text-xs text-destructive max-w-[200px]"
              title={rc.errorMessage}
            >
              {rc.errorMessage}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

export function buildPantauanColumns(lens: PantauanLens): ColumnDef<PantauanProduct>[] {
  const isReviewLens = lens === "direview" || lens === "ditolak"

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
        : isReviewLens
          ? {
              id: "review_status",
              header: lens === "direview" ? "Status Review" : "Alasan Ditolak",
              cell: ({ row }) => reviewChannelsCell(row.original, lens === "ditolak"),
            }
          : {
              id: "lens",
              header: "Keterangan",
              cell: () => {
                const b = LENS_BADGE[lens]
                return b ? (
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${b.cls}`}>{b.label}</span>
                ) : null
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
          {isReviewLens ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/produk/${row.original.productId}`}>
                <ExternalLinkIcon className="size-4" />
                Detail
              </Link>
            </Button>
          ) : (
            <Button variant="primary" size="sm" asChild>
              <Link href={`/dashboard/produk/${row.original.productId}/upload-to-channel`}>
                <UploadIcon className="size-4" />
                Upload
              </Link>
            </Button>
          )}
        </div>
      ),
      size: 100,
    },
  ]
}
