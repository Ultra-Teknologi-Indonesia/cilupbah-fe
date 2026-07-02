"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, CheckIcon, Loader2Icon, MapPinIcon, ScanBarcodeIcon } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { PageTitle } from "@/components/dashboard/page-title"
import { ScanAutoflowBar } from "@/components/dashboard/shared/scan-autoflow-bar"
import { StatusBadge } from "@/components/dashboard/shared/status-badge"
import { playScanFeedback } from "@/lib/scan-feedback"
import {
  usePicklistDetail,
  useStartPicklist,
  usePickItem,
  useCompletePicklist,
  useFailPicklist,
} from "@/hooks/proses-pesanan/use-fulfillment"
import { useLocationBins } from "@/hooks/transaksi-stok/use-bin-transfer"
import { type PicklistItem } from "@/types/proses-pesanan/fulfillment"

const LIST_HREF = "/dashboard/proses-pesanan"

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === "string" && m) return m
  }
  return fallback
}

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "")
}

interface ActiveRack {
  id: string
  code: string
}

export function PickingDetailView({ id }: { id: string }) {
  const router = useRouter()

  const { data: pl, isLoading, isError } = usePicklistDetail(id)
  const startPicklist = useStartPicklist()
  const pickItem = usePickItem()
  const completePicklist = useCompletePicklist()
  const failPicklist = useFailPicklist()

  const items = React.useMemo<PicklistItem[]>(() => pl?.items ?? [], [pl])
  const { data: binData } = useLocationBins(pl?.locationId ?? "")
  const bins = React.useMemo(() => binData?.items ?? [], [binData])

  const [activeRack, setActiveRack] = React.useState<ActiveRack | null>(null)
  const [activePick, setActivePick] = React.useState<{ itemId: string; remaining: number } | null>(null)
  const [qtyInput, setQtyInput] = React.useState("")
  const [scanFocusKey, setScanFocusKey] = React.useState(0)
  const qtyRef = React.useRef<HTMLInputElement>(null)

  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0)
  const totalPicked = items.reduce((s, i) => s + i.qtyPicked, 0)
  const allPicked = items.length > 0 && items.every((i) => i.qtyPicked >= i.qtyOrdered)
  const isTerminal = pl ? ["COMPLETED", "FAILED", "CANCELLED"].includes(pl.status) : false
  const editable = !!pl && !isTerminal

  const refocusScan = React.useCallback(() => setScanFocusKey((k) => k + 1), [])

  const savePick = React.useCallback(
    (itemId: string, qtyAbsolute: number, binCode: string) => {
      pickItem.mutate(
        { picklistId: id, itemId, qtyPicked: qtyAbsolute, binCode },
        {
          onSuccess: () => { toast.success("Qty pick tersimpan."); playScanFeedback("ok") },
          onError: (e) => { toast.error(errMsg(e, "Gagal menyimpan pick.")); playScanFeedback("error") },
        }
      )
    },
    [pickItem, id]
  )

  // Buka input qty (untuk item qty > 1). Fokus otomatis; Enter = konfirmasi.
  const openQty = React.useCallback((item: PicklistItem, remaining: number) => {
    setActivePick({ itemId: item.id, remaining })
    setQtyInput(String(remaining))
    setTimeout(() => { qtyRef.current?.focus(); qtyRef.current?.select() }, 40)
  }, [])

  // Inti pick untuk sebuah item (dipakai scan). return true bila tertangani (visual ok).
  const handlePick = React.useCallback(
    (item: PicklistItem): boolean => {
      if (!activeRack) {
        toast.error("Scan rak dulu sebelum scan produk.")
        playScanFeedback("error")
        return false
      }
      const remaining = item.qtyOrdered - item.qtyPicked
      if (remaining <= 0) {
        toast.info(`${item.sku} sudah lengkap.`)
        playScanFeedback("error")
        return false
      }
      if (remaining === 1) {
        savePick(item.id, item.qtyPicked + 1, activeRack.code)
        return true
      }
      openQty(item, remaining)
      playScanFeedback("ok")
      return true
    },
    [activeRack, savePick, openQty]
  )

  // Kode masuk: rak dulu (set rak aktif), lalu SKU (pick). return true bila dikenali.
  const interceptCode = React.useCallback(
    (raw: string): boolean => {
      const n = norm(raw)

      const rack = bins.find((b) => norm(b.binFinalCode) === n)
      if (rack) {
        setActiveRack({ id: rack.id, code: rack.binFinalCode })
        setActivePick(null)
        playScanFeedback("ok")
        return true
      }

      const item = items.find((i) => norm(i.sku) === n)
      if (item) {
        return handlePick(item)
      }

      toast.error(`Kode "${raw}" tidak dikenal (bukan rak/SKU di picklist ini).`)
      playScanFeedback("error")
      return false
    },
    [bins, items, handlePick]
  )

  const confirmQty = React.useCallback(() => {
    if (!activePick || !activeRack) return
    const item = items.find((i) => i.id === activePick.itemId)
    if (!item) return
    const qty = Number.parseInt(qtyInput, 10)
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Masukkan qty yang valid.")
      return
    }
    if (qty > activePick.remaining) {
      toast.error(`Qty melebihi sisa (${activePick.remaining}).`)
      return
    }
    savePick(item.id, item.qtyPicked + qty, activeRack.code)
    setActivePick(null)
    setQtyInput("")
    refocusScan()
  }, [activePick, activeRack, items, qtyInput, savePick, refocusScan])

  const handleComplete = () => {
    completePicklist.mutate(id, {
      onSuccess: () => { toast.success("Picking selesai."); router.push(LIST_HREF) },
      onError: (e) => toast.error(errMsg(e, "Gagal menyelesaikan picking.")),
    })
  }

  const handleFail = () => {
    const reason = window.prompt("Alasan gagal picking (opsional):") ?? undefined
    failPicklist.mutate(
      { id, reason },
      {
        onSuccess: () => { toast.success("Picklist ditandai gagal."); router.push(LIST_HREF) },
        onError: (e) => toast.error(errMsg(e, "Gagal menandai picklist.")),
      }
    )
  }

  const activeItem = activePick ? items.find((i) => i.id === activePick.itemId) : null

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={pl ? `Picking ${pl.picklistNo}` : "Picking"}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Picking" },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link href={LIST_HREF}>
              <ArrowLeftIcon /> Kembali
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Memuat picklist…
        </div>
      ) : isError || !pl ? (
        <div className="py-24 text-center text-sm text-destructive">Gagal memuat picklist.</div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Status</div>
                <StatusBadge domain="picklist" status={pl.status} className="mt-0.5" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Lokasi</div>
                <div className="font-medium">{pl.locationName ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Picker</div>
                <div className="font-medium">{pl.pickerName ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="font-medium tabular-nums">{totalPicked} / {totalOrdered}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {pl.status === "DRAFT" && (
                <Button
                  variant="outline"
                  onClick={() =>
                    startPicklist.mutate(id, {
                      onSuccess: () => toast.success("Picking dimulai."),
                      onError: (e) => toast.error(errMsg(e, "Gagal memulai picking.")),
                    })
                  }
                  disabled={startPicklist.isPending}
                >
                  Mulai Picking
                </Button>
              )}
              {editable && (
                <Button variant="ghost" className="text-destructive" onClick={handleFail}>
                  Gagal
                </Button>
              )}
              {editable && (
                <Button variant="primary" onClick={handleComplete} disabled={!allPicked || completePicklist.isPending}>
                  {completePicklist.isPending && <Loader2Icon className="animate-spin" />}
                  Selesaikan
                </Button>
              )}
            </div>
          </div>

          {editable && (
            <div className="flex flex-col gap-3">
              {/* Rak aktif */}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm",
                  activeRack
                    ? "border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-500/30 dark:text-emerald-400"
                    : "border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-500/30 dark:text-amber-400"
                )}
              >
                <MapPinIcon className="size-4 shrink-0" />
                {activeRack ? (
                  <span>Rak aktif: <b className="font-mono">{activeRack.code}</b> — scan SKU untuk pick.</span>
                ) : (
                  <span>Scan <b>rak</b> dulu sebelum scan produk.</span>
                )}
              </div>

              {/* Scan: rak lalu SKU. Qty 1 otomatis; qty >1 buka input qty. */}
              <ScanAutoflowBar
                lines={[]}
                onResolve={() => {}}
                interceptCode={interceptCode}
                refocusKey={scanFocusKey}
                sound={false}
                scanPlaceholder="Scan rak / SKU lalu Enter…"
                manualPlaceholder=""
                hint="Scan rak → scan SKU. Qty 1 selesai otomatis; qty >1 masukkan jumlah lalu Enter."
                className="max-w-2xl"
              />

              {/* Input qty untuk item qty > 1 */}
              {activePick && activeItem && (
                <div className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-muted-foreground">Qty untuk</div>
                    <div className="truncate text-sm font-medium">{activeItem.name ?? activeItem.sku}</div>
                    <div className="text-xs text-muted-foreground">Sisa {activePick.remaining} · rak {activeRack?.code}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium">Jumlah diambil</label>
                    <Input
                      ref={qtyRef}
                      type="number"
                      min={1}
                      max={activePick.remaining}
                      inputMode="numeric"
                      value={qtyInput}
                      onChange={(e) => setQtyInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirmQty() } }}
                      className="h-10 w-28 text-base"
                    />
                  </div>
                  <Button onClick={confirmQty} disabled={pickItem.isPending}>
                    <CheckIcon className="mr-1 size-4" /> Simpan
                  </Button>
                  <Button variant="ghost" onClick={() => { setActivePick(null); refocusScan() }}>Batal</Button>
                </div>
              )}
            </div>
          )}

          {/* Daftar item (progres, read-only — semua lewat scan) */}
          <div className="overflow-x-auto rounded-2xl border border-border">
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>SKU / Produk</TableHead>
                  <TableHead className="text-right">Qty Dipesan</TableHead>
                  <TableHead className="text-right">Qty Dipick</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">Tidak ada item.</TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => {
                    const done = item.qtyPicked >= item.qtyOrdered
                    return (
                      <TableRow key={item.id} className={cn(done && "bg-emerald-500/[0.04]")}>
                        <TableCell>
                          <div className="flex min-w-0 flex-col gap-0.5">
                            <span className="whitespace-normal font-medium">{item.name ?? item.sku}</span>
                            {item.name && <span className="font-mono text-[11px] text-muted-foreground">{item.sku}</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">{item.qtyOrdered}</TableCell>
                        <TableCell className="text-right tabular-nums">{item.qtyPicked}</TableCell>
                        <TableCell>
                          {done ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckIcon className="size-3.5" /> Selesai
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <ScanBarcodeIcon className="size-3.5" /> Kurang {item.qtyOrdered - item.qtyPicked}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
