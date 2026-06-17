"use client"

import * as React from "react"
import { CloudDownloadIcon, SearchIcon, StoreIcon } from "lucide-react"

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
import { useStartDownload } from "@/hooks/master-produk/use-download"

export function DownloadMassalDialog({
  open,
  onOpenChange,
  onQueued,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Dipanggil setelah download diantrekan (mis. pindah ke tab Progress). */
  onQueued?: () => void
}) {
  const { data: stores = [] } = useConnectedStores()
  const start = useStartDownload()

  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})

  // Reset saat dibuka (render-phase guard, bukan effect).
  const [prevOpen, setPrevOpen] = React.useState(open)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setSearch("")
      setSelected({})
    }
  }

  const activeStores = React.useMemo(
    () => stores.filter((s) => s.is_active && s.channel?.code),
    [stores]
  )
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase()
    return q
      ? activeStores.filter(
          (s) =>
            s.shop_name.toLowerCase().includes(q) ||
            (s.channel?.name ?? "").toLowerCase().includes(q)
        )
      : activeStores
  }, [activeStores, search])

  const selectedStores = activeStores.filter((s) => selected[s.shop_id])
  const allFilteredSelected = filtered.length > 0 && filtered.every((s) => selected[s.shop_id])

  const toggleAll = () => {
    setSelected((prev) => {
      const next = { ...prev }
      const target = !allFilteredSelected
      for (const s of filtered) next[s.shop_id] = target
      return next
    })
  }

  const submit = async () => {
    await start.mutateAsync(
      selectedStores.map((s) => ({ channel: s.channel!.code, shopId: s.shop_id }))
    )
    onOpenChange(false)
    onQueued?.()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Download Massal</DialogTitle>
          <DialogDescription>
            Tarik seluruh produk dari toko terpilih ke katalog (status download).
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari toko"
            className="h-9 rounded-lg pl-9"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={toggleAll}
            disabled={filtered.length === 0}
            className="font-medium text-primary hover:underline disabled:opacity-50"
          >
            {allFilteredSelected ? "Batalkan semua" : "Pilih semua"}
          </button>
          <span className="text-muted-foreground">
            {selectedStores.length} toko dipilih
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-xl border border-border/60">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Tidak ada toko aktif.
            </div>
          ) : (
            <ul className="divide-y divide-border/60">
              {filtered.map((s) => (
                <li key={s.shop_id}>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors hover:bg-muted/50",
                      selected[s.shop_id] && "bg-primary/[0.04]"
                    )}
                  >
                    <Checkbox
                      checked={!!selected[s.shop_id]}
                      onCheckedChange={(v) =>
                        setSelected((prev) => ({ ...prev, [s.shop_id]: !!v }))
                      }
                    />
                    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-muted">
                      <StoreIcon className="size-4 text-muted-foreground" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{s.shop_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {s.channel?.name ?? s.channel?.code}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={start.isPending}>
            Batal
          </Button>
          <Button
            variant="primary"
            className="gap-2"
            onClick={submit}
            disabled={selectedStores.length === 0 || start.isPending}
          >
            <CloudDownloadIcon className="size-4" />
            {start.isPending ? "Memproses…" : "Mulai Download"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
