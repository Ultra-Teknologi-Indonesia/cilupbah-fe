"use client"

import type { ColumnDef } from "@tanstack/react-table"
import {
  CheckIcon,
  ChevronRightIcon,
  DownloadIcon,
  ImageIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  PowerIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo"
import { SyncStatusBadge } from "../detail/tab-pagination"
import {
  channelListingRowId,
  type ChannelListing,
  type ChannelListingVariant,
} from "@/hooks/master-produk/use-channel-products"
import type { ChannelCode } from "@/types/channel"
import { formatIDR } from "../product-columns"

const VISIBLE = 4

type Ctx = {
  expanded: Set<string>
  onToggle: (id: string) => void
  onDownload: (l: ChannelListing) => void
  onUnlink: (l: ChannelListing) => void
  onActivate: (l: ChannelListing) => void
  onDeactivate: (l: ChannelListing) => void
  onSync: (l: ChannelListing) => void
  busyIds: Set<string>
}

/** Kolom-kolom yang menumpuk per-varian dengan slice + link "N ... lainnya". */
function stack(
  listing: ChannelListing,
  ctx: Ctx,
  render: (v: ChannelListingVariant) => React.ReactNode,
  moreLabel: string
) {
  const id = channelListingRowId(listing)
  const isExpanded = ctx.expanded.has(id)
  const variants = listing.variants
  const shown = isExpanded ? variants : variants.slice(0, VISIBLE)
  const extra = variants.length - shown.length

  return (
    <div className="flex flex-col gap-0.5">
      {shown.length === 0 ? (
        <span className="text-sm text-muted-foreground">—</span>
      ) : (
        shown.map((v, i) => (
          <span key={i} className="whitespace-nowrap text-sm">
            {render(v)}
          </span>
        ))
      )}
      {extra > 0 && (
        <button
          type="button"
          onClick={() => ctx.onToggle(id)}
          className="text-left text-xs font-medium text-primary hover:underline"
        >
          {extra} {moreLabel} lainnya
        </button>
      )}
    </div>
  )
}

export function buildChannelListingColumns(ctx: Ctx): ColumnDef<ChannelListing>[] {
  return [
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
      id: "produk",
      header: "Produk",
      cell: ({ row }) => {
        const l = row.original
        const id = channelListingRowId(l)
        const canExpand = l.variants.length > VISIBLE
        return (
          <div className="flex items-start gap-3">
            {canExpand ? (
              <Button
                variant="ghost"
                size="icon-xs"
                className="mt-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  ctx.onToggle(id)
                }}
                aria-label="Lihat semua SKU"
              >
                <ChevronRightIcon
                  className={cn(
                    "size-4 transition-transform",
                    ctx.expanded.has(id) && "rotate-90"
                  )}
                />
              </Button>
            ) : (
              <span className="inline-block w-6" />
            )}
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
              {l.thumbnail ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.thumbnail} alt={l.itemGroupName ?? ""} className="size-full object-cover" />
              ) : (
                <ImageIcon className="size-4 text-muted-foreground" />
              )}
            </div>
            <span className="mt-0.5 line-clamp-2 max-w-[220px] font-medium">
              {l.itemGroupName ?? "—"}
            </span>
          </div>
        )
      },
    },
    {
      id: "sku_channel",
      header: "SKU Channel",
      cell: ({ row }) => stack(row.original, ctx, (v) => <span className="font-mono">{v.channelSku ?? "—"}</span>, "SKU"),
    },
    {
      id: "sku_jubelio",
      header: "SKU Master",
      cell: ({ row }) => stack(row.original, ctx, (v) => <span className="font-mono">{v.masterSku ?? "—"}</span>, "SKU"),
    },
    {
      id: "variasi",
      header: "Variasi",
      cell: ({ row }) => stack(row.original, ctx, (v) => v.variation ?? "—", "variasi"),
    },
    {
      id: "harga_min",
      header: "Harga Minimal",
      cell: ({ row }) =>
        stack(row.original, ctx, (v) => <span className="tabular-nums">{formatIDR(v.minPrice)}</span>, "harga"),
    },
    {
      id: "harga_max",
      header: "Harga Maksimal",
      cell: ({ row }) =>
        stack(row.original, ctx, (v) => <span className="tabular-nums">{formatIDR(v.maxPrice)}</span>, "harga"),
    },
    {
      id: "toko",
      header: "Toko",
      enableSorting: false,
      cell: ({ row }) => {
        const l = row.original
        return (
          <div className="flex items-center gap-2">
            <ChannelLogo code={(l.channelCode ?? "") as ChannelCode} name={l.storeName ?? ""} className="size-6 rounded-md text-[10px]" />
            <span className="whitespace-nowrap text-sm">{l.storeName ?? "—"}</span>
          </div>
        )
      },
    },
    {
      id: "status",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => {
        const l = row.original
        return (
          <div className="flex flex-col gap-0.5">
            <SyncStatusBadge status={l.syncStatus} reason={l.errorMessage} />
            {l.errorMessage && (l.syncStatus === "rejected" || l.syncStatus === "failed") && (
              <span className="truncate text-xs text-destructive max-w-[180px]" title={l.errorMessage}>
                {l.errorMessage}
              </span>
            )}
          </div>
        )
      },
      size: 140,
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        const l = row.original
        const busy = ctx.busyIds.has(channelListingRowId(l))
        const noShop = !l.shopId || !l.channelCode
        return (
          <div className="flex items-center justify-end gap-1">
            {busy ? (
              <span className="grid size-8 place-items-center text-muted-foreground">
                <Loader2Icon className="size-4 animate-spin motion-reduce:animate-none" />
              </span>
            ) : l.hasProductData ? (
              <span
                className="grid size-8 place-items-center text-emerald-600 dark:text-emerald-400"
                title="Data master tersinkron dengan channel"
              >
                <CheckIcon className="size-4" />
              </span>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground hover:text-foreground"
                disabled={noShop}
                onClick={() => ctx.onDownload(l)}
                title="Download data dari channel"
              >
                <DownloadIcon className="size-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              disabled={busy || noShop || !l.channelGroupId}
              onClick={() => ctx.onUnlink(l)}
              title="Putuskan koneksi"
            >
              <Trash2Icon className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground"
                  disabled={busy || noShop || !l.channelGroupId}
                  title="Aksi lain"
                >
                  <MoreHorizontalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {l.syncStatus === "deactivated" ? (
                  <DropdownMenuItem onClick={() => ctx.onActivate(l)}>
                    <PowerIcon className="size-4 text-muted-foreground" />
                    Aktifkan
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => ctx.onDeactivate(l)}>
                    <PowerIcon className="size-4 text-muted-foreground" />
                    Nonaktifkan
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => ctx.onSync(l)}>
                  <RefreshCwIcon className="size-4 text-muted-foreground" />
                  Sinkron harga & stok
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
      size: 110,
    },
  ]
}
