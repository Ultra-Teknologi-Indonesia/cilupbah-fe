"use client"

import Link from "next/link"
import type { ColumnDef } from "@tanstack/react-table"
import { EyeIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo"
import type { RaiseProductStore } from "@/services/master-produk/naikkan.service"
import type { ChannelCode } from "@/types/channel"

export function buildStoreColumns(
  onDelete: (store: RaiseProductStore) => void
): ColumnDef<RaiseProductStore>[] {
  return [
    {
      id: "store",
      header: "Nama Toko",
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex items-center gap-3">
            {s.channelCode && (
              <ChannelLogo
                code={s.channelCode as ChannelCode}
                name={s.channelName ?? s.channelCode}
                className="size-8 rounded-lg text-[10px]"
              />
            )}
            <div className="min-w-0">
              <Link
                href={`/dashboard/produk/naikkan/${s.raiseproductId}`}
                prefetch={false}
                className="line-clamp-1 font-medium hover:text-primary hover:underline"
              >
                {s.storeName ?? "—"}
              </Link>
              <div className="text-xs text-muted-foreground">
                {s.channelName ?? s.channelCode ?? "—"}
              </div>
            </div>
          </div>
        )
      },
    },
    {
      id: "product_active",
      header: "Produk Aktif",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary tabular-nums">
          {row.original.productActive}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex items-center justify-end gap-1">
            <Button variant="ghost" size="sm" className="h-8 gap-1.5" asChild>
              <Link href={`/dashboard/produk/naikkan/${s.raiseproductId}`} prefetch={false}>
                <EyeIcon className="size-4" />
                Lihat
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-destructive hover:text-destructive"
              onClick={() => onDelete(s)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}
