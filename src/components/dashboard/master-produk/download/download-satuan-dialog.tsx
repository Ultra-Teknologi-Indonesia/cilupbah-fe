"use client"

import * as React from "react"
import { toast } from "sonner"
import { CloudDownloadIcon, ImageIcon, Loader2Icon, SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useConnectedStores } from "@/hooks/channel/use-connected-stores"
import { useDownloadProduct } from "@/hooks/master-produk/use-download"
import {
  DownloadService,
  channelSearchRowId,
  type ChannelSearchItem,
} from "@/services/master-produk/download.service"

// Channel yang mendukung pencarian produk by SKU/nama.
const SUPPORTED = new Set(["tiktok", "lazada", "shopee"])

export function DownloadSatuanDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { data: stores = [] } = useConnectedStores()
  const downloadOne = useDownloadProduct()

  const [q, setQ] = React.useState("")
  const [selectedStores, setSelectedStores] = React.useState<Record<string, boolean>>({})
  const [results, setResults] = React.useState<ChannelSearchItem[] | null>(null)
  const [searching, setSearching] = React.useState(false)
  const [rowSel, setRowSel] = React.useState<Record<string, boolean>>({})
  const [downloaded, setDownloaded] = React.useState<Record<string, boolean>>({})
  const [pending, setPending] = React.useState<Record<string, boolean>>({})

  // Reset saat dibuka (render-phase guard, bukan effect).
  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setQ("")
      setSelectedStores({})
      setResults(null)
      setRowSel({})
      setDownloaded({})
      setPending({})
    }
  }

  const supportedStores = React.useMemo(
    () => stores.filter((s) => s.is_active && s.channel?.code && SUPPORTED.has(s.channel.code)),
    [stores]
  )
  const chosen = supportedStores.filter((s) => selectedStores[s.shop_id])

  const apply = async () => {
    if (chosen.length === 0) {
      toast("Pilih minimal satu toko")
      return
    }
    setSearching(true)
    setResults(null)
    setRowSel({})
    try {
      const batches = await Promise.all(
        chosen.map((s) =>
          DownloadService.searchChannel({ channel: s.channel!.code, shopId: s.shop_id, q })
            .catch(() => [] as ChannelSearchItem[])
        )
      )
      setResults(batches.flat())
    } finally {
      setSearching(false)
    }
  }

  const runDownload = async (item: ChannelSearchItem) => {
    const id = channelSearchRowId(item)
    setPending((p) => ({ ...p, [id]: true }))
    try {
      await downloadOne.mutateAsync({
        channel: item.channelCode,
        shopId: item.shopId,
        externalProductId: item.externalProductId,
      })
      setDownloaded((d) => ({ ...d, [id]: true }))
    } catch {
      /* toast ditangani hook */
    } finally {
      setPending((p) => ({ ...p, [id]: false }))
    }
  }

  const items = results ?? []
  const selectedItems = items.filter((i) => rowSel[channelSearchRowId(i)])
  const bulkBusy = Object.values(pending).some(Boolean)

  const bulkDownload = async () => {
    for (const item of selectedItems) {
      if (downloaded[channelSearchRowId(item)]) continue
      await runDownload(item)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-4 overflow-hidden sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Download Dari Channel</DialogTitle>
          <DialogDescription>
            Cari produk yang sudah diunggah di marketplace berdasarkan SKU/nama, lalu unduh
            datanya. Mendukung TikTok, Lazada &amp; Shopee.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-[16rem_1fr]">
          {/* Filter */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari nama & SKU"
                className="h-9 rounded-lg pl-9"
                onKeyDown={(e) => e.key === "Enter" && apply()}
              />
            </div>

            <div className="max-h-48 overflow-y-auto rounded-lg border border-border/60">
              {supportedStores.length === 0 ? (
                <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                  Belum ada toko aktif.
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {supportedStores.map((s) => (
                    <li key={s.shop_id}>
                      <label className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50">
                        <Checkbox
                          checked={!!selectedStores[s.shop_id]}
                          onCheckedChange={(v) =>
                            setSelectedStores((prev) => ({ ...prev, [s.shop_id]: !!v }))
                          }
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate">{s.shop_name}</span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {s.channel?.name}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button variant="primary" className="w-full" onClick={apply} disabled={searching}>
              {searching ? "Mencari…" : "Terapkan"}
            </Button>
          </div>

          {/* Daftar produk */}
          <div className="flex min-h-0 flex-col rounded-xl border border-border/60">
            <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
              <span className="text-sm font-medium">Daftar Produk</span>
              <span className="text-xs text-muted-foreground">
                Total <span className="font-medium text-foreground">{items.length}</span>
              </span>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between gap-2 border-b border-border/60 bg-muted/40 px-3 py-2 text-sm">
                <span>{selectedItems.length} dipilih</span>
                <Button size="sm" className="h-7 gap-1.5" onClick={bulkDownload} disabled={bulkBusy}>
                  <CloudDownloadIcon className="size-3.5" />
                  Download Produk
                </Button>
              </div>
            )}

            <div className="min-h-40 flex-1 overflow-y-auto">
              {searching ? (
                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
                  <Loader2Icon className="mr-2 size-4 animate-spin" /> Mencari produk…
                </div>
              ) : results === null ? (
                <div className="flex h-40 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                  <SearchIcon className="size-6" />
                  Pilih toko & masukkan SKU, lalu Terapkan.
                </div>
              ) : items.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center gap-1 text-center text-sm text-muted-foreground">
                  Belum Ada Data!
                </div>
              ) : (
                <ul className="divide-y divide-border/60">
                  {items.map((item) => {
                    const id = channelSearchRowId(item)
                    const isDone = downloaded[id]
                    return (
                      <li key={id} className="flex items-center gap-3 px-3 py-2.5">
                        <Checkbox
                          checked={!!rowSel[id]}
                          disabled={isDone}
                          onCheckedChange={(v) => setRowSel((prev) => ({ ...prev, [id]: !!v }))}
                        />
                        <div className="size-9 shrink-0 overflow-hidden rounded-md bg-muted/40">
                          {item.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.image} alt={item.name} className="size-full object-cover" />
                          ) : (
                            <div className="flex size-full items-center justify-center">
                              <ImageIcon className="size-4 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {item.sellerSku ?? "—"} · {item.shopName ?? item.channelCode}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isDone ? "outline" : "primary"}
                          className={cn("h-8 shrink-0 gap-1.5")}
                          onClick={() => runDownload(item)}
                          disabled={isDone || pending[id]}
                        >
                          {pending[id] ? (
                            <Loader2Icon className="size-3.5 animate-spin" />
                          ) : (
                            <CloudDownloadIcon className="size-3.5" />
                          )}
                          {isDone ? "Terunduh" : "Download Produk"}
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
