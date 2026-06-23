"use client"

import * as React from "react"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ImageIcon,
  XCircleIcon,
} from "lucide-react"

import { Input } from "@/components/ui/input"
import { Combobox } from "@/components/ui/combobox"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useDownloadTransactionDetail,
} from "@/hooks/master-produk/use-download"
import type { DownloadTransaction } from "@/services/master-produk/download.service"

const MASTER_FILTER: { value: string; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "master", label: "Master" },
  { value: "not_master", label: "Belum dijadikan Master" },
]

export function TransactionDetailSheet({
  trx,
  open,
  onOpenChange,
}: {
  trx: DownloadTransaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [search, setSearch] = React.useState("")
  const [masterFilter, setMasterFilter] = React.useState<string>("all")

  // Reset filter saat buka / ganti transaksi (render-phase guard, bukan effect).
  const resetKey = open ? trx?.trxId ?? "" : null
  const [prevKey, setPrevKey] = React.useState<string | null>(resetKey)
  if (prevKey !== resetKey) {
    setPrevKey(resetKey)
    setSearch("")
    setMasterFilter("all")
  }

  const isMaster = masterFilter === "all" ? undefined : masterFilter === "master"

  const query = useDownloadTransactionDetail(open ? trx?.trxId ?? null : null, {
    search: search || undefined,
    isMaster,
    perPage: 100,
  })
  const detail = query.data
  const products = detail?.products ?? []
  const pct = Math.min(100, Math.max(0, detail?.percent ?? trx?.progressPercent ?? 0))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader className="border-b border-border/60">
          <SheetDescription>Download dari toko</SheetDescription>
          <SheetTitle>Mendownload dari {trx?.storeName ?? detail?.transaction.storeName ?? "—"}</SheetTitle>
          <div className="mt-1 text-sm text-muted-foreground">
            No. Transaksi: <span className="font-medium text-foreground">{trx?.trxNo ?? detail?.transaction.trxNo}</span>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-medium tabular-nums">{pct}%</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {detail ? `${detail.count} produk` : "Memuat…"}
          </div>
        </SheetHeader>

        {/* Filter */}
        <div className="flex flex-wrap items-center gap-2 px-6 py-3">
          <div className="relative min-w-0 flex-1">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama / SKU…"
              className="h-9"
            />
          </div>
          <Combobox
            options={MASTER_FILTER}
            value={masterFilter}
            onChange={(v) => setMasterFilter(v ?? "all")}
            placeholder="Status Produk"
            searchPlaceholder="Status"
            className="h-9 w-52"
          />
        </div>

        {/* Daftar produk */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6">
          {query.isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Tidak ada produk.</div>
          ) : (
            <div className="divide-y divide-border/60">
              {products.map((p) => {
                const ok = p.status !== "failed"
                return (
                  <div key={p.itemId} className="flex items-center gap-3 py-3">
                    <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted/40">
                      {p.imgUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.imgUrl} alt={p.itemName} className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center">
                          <ImageIcon className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        <Link
                          href={`/dashboard/produk/${p.itemId}`}
                         
                          className="hover:text-primary hover:underline"
                        >
                          {p.itemName}
                        </Link>
                      </p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{p.itemCode ?? "—"}</p>
                    </div>

                    <div className="shrink-0" title={ok ? "Berhasil" : "Gagal"}>
                      {ok ? (
                        <CheckCircle2Icon className="size-5 text-emerald-500" />
                      ) : (
                        <XCircleIcon className="size-5 text-destructive" />
                      )}
                    </div>

                    <div className="w-44 shrink-0 text-right">
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Master
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
