"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckIcon,
  Loader2Icon,
  PackageIcon,
  ScanBarcodeIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  usePicklistDetail,
  useStartPicklist,
  usePickItem,
  useCompletePicklist,
} from "@/hooks/proses-pesanan/use-fulfillment"
import {
  PICKLIST_STATUS_LABEL,
  type PicklistItem,
} from "@/types/proses-pesanan/fulfillment"

const LIST_HREF = "/dashboard/proses-pesanan"

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === "string" && m) return m
  }
  return fallback
}

function ItemImage({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = React.useState(false)
  if (!src || errored) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground">
        <PackageIcon className="size-5" />
      </div>
    )
  }
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="48px"
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  )
}

function statusBadge(s: string | null, picked: number, ordered: number): { label: string; className: string } {
  if (picked >= ordered && ordered > 0) {
    return { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" }
  }
  if (picked > 0) {
    return { label: "Sebagian", className: "bg-amber-500/10 text-amber-600" }
  }
  if (s === "PICKED") return { label: "Selesai", className: "bg-emerald-500/10 text-emerald-600" }
  return { label: "Belum", className: "bg-muted text-muted-foreground" }
}

export function PickingProsesView({ id }: { id: string }) {
  const router = useRouter()

  const skuScanRef = React.useRef<HTMLInputElement>(null)
  const binScanRef = React.useRef<HTMLInputElement>(null)
  const qtyInputRef = React.useRef<HTMLInputElement>(null)

  const [skuScan, setSkuScan] = React.useState("")
  const [binScan, setBinScan] = React.useState("")
  const [scannedBinCode, setScannedBinCode] = React.useState<string | null>(null)
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null)
  const [pickQty, setPickQty] = React.useState("")
  const [notes, setNotes] = React.useState("")

  const { data: pl, isLoading, isError } = usePicklistDetail(id)
  const startPicklist = useStartPicklist()
  const pickItem = usePickItem()
  const completePicklist = useCompletePicklist()

  const items = React.useMemo(() => pl?.items ?? [], [pl])

  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0)
  const totalPicked = items.reduce((s, i) => s + i.qtyPicked, 0)
  const allPicked = items.length > 0 && items.every((i) => i.qtyPicked >= i.qtyOrdered)
  const isTerminal = pl ? ["COMPLETED", "FAILED", "CANCELLED"].includes(pl.status) : false
  const editable = !!pl && !isTerminal

  React.useEffect(() => {
    if (pl && pl.status === "COMPLETED") {
      toast.info(`Picklist ${pl.picklistNo} sudah selesai.`)
      router.replace(LIST_HREF)
    }
  }, [pl, router])

  const didAutoStart = React.useRef(false)
  React.useEffect(() => {
    if (!pl || didAutoStart.current) return
    if (pl.status === "DRAFT") {
      didAutoStart.current = true
      startPicklist.mutate(id, {
        onError: (e) => toast.error(errMsg(e, "Gagal memulai picking.")),
      })
    }
  }, [pl, id, startPicklist])

  // Auto-complete ketika semua item sudah di-pick
  const didAutoComplete = React.useRef(false)
  React.useEffect(() => {
    if (!pl || didAutoComplete.current || !editable) return
    if (allPicked) {
      didAutoComplete.current = true
      completePicklist.mutate(id, {
        onSuccess: () => {
          toast.success("Semua item sudah di-pick. Picking selesai!")
          router.push(LIST_HREF)
        },
        onError: (e) => {
          didAutoComplete.current = false
          toast.error(errMsg(e, "Gagal menyelesaikan picking."))
        },
      })
    }
  }, [pl, allPicked, editable, id, completePicklist, router])

  function findItemForSku(code: string): PicklistItem | null {
    const lower = code.toLowerCase()
    return (
      items.find((it) => it.sku.toLowerCase() === lower && it.qtyPicked < it.qtyOrdered) ??
      items.find((it) => it.sku.toLowerCase() === lower) ??
      items.find((it) => (it.sku ?? "").toLowerCase().includes(lower) && it.qtyPicked < it.qtyOrdered) ??
      null
    )
  }

  const activeItem = activeItemId ? items.find((i) => i.id === activeItemId) ?? null : null

  const BIN_CODE_PATTERN = /^L\d+-B\d+-K\d+-R\d+$/i

  const handleScanSku = () => {
    const code = skuScan.trim()
    if (!code) return
    if (!editable) return
    if (!scannedBinCode) {
      toast.warning("Scan kode rak dulu sebelum scan SKU.")
      setSkuScan("")
      binScanRef.current?.focus()
      return
    }
    if (BIN_CODE_PATTERN.test(code) || code === scannedBinCode) {
      toast.error(`"${code}" adalah kode rak, bukan SKU produk.`)
      setSkuScan("")
      skuScanRef.current?.focus()
      return
    }
    const item = findItemForSku(code)
    setSkuScan("")
    if (!item) {
      toast.error(`SKU / Barcode "${code}" tidak ditemukan.`)
      skuScanRef.current?.focus()
      return
    }
    if (item.qtyPicked >= item.qtyOrdered) {
      toast.warning(`${item.sku} sudah penuh (qty terpenuhi).`)
      skuScanRef.current?.focus()
      return
    }
    const remaining = item.qtyOrdered - item.qtyPicked
    setActiveItemId(item.id)
    setPickQty(String(remaining))
    setTimeout(() => qtyInputRef.current?.select(), 50)
  }

  const handleConfirmPick = () => {
    if (!activeItem || !scannedBinCode) return
    const qty = Number.parseInt(pickQty, 10)
    const remaining = activeItem.qtyOrdered - activeItem.qtyPicked
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Masukkan qty yang valid.")
      return
    }
    if (qty > remaining) {
      toast.error(`Qty melebihi sisa yang harus di-pick (${remaining}).`)
      return
    }
    pickItem.mutate(
      {
        picklistId: id,
        itemId: activeItem.id,
        qtyPicked: activeItem.qtyPicked + qty,
        binCode: scannedBinCode,
      },
      {
        onSuccess: () => {
          toast.success(`${activeItem.sku} berhasil di-pick (${activeItem.qtyPicked + qty}/${activeItem.qtyOrdered}).`)
          setActiveItemId(null)
          setPickQty("")
          skuScanRef.current?.focus()
        },
        onError: (e) => {
          toast.error(errMsg(e, `Gagal pick ${activeItem.sku}.`))
        },
      }
    )
  }

  const handleCancelPick = () => {
    setActiveItemId(null)
    setPickQty("")
    skuScanRef.current?.focus()
  }

  const handleScanBin = () => {
    const code = binScan.trim()
    if (!code) return
    const isSku = items.some((i) => i.sku.toLowerCase() === code.toLowerCase())
    if (isSku) {
      toast.error(`"${code}" adalah SKU produk, bukan kode rak.`)
      setBinScan("")
      binScanRef.current?.focus()
      return
    }
    setBinScan("")
    setScannedBinCode(code)
    toast.success(`Rak ${code} aktif.`)
    setTimeout(() => skuScanRef.current?.focus(), 50)
  }

  const handleComplete = () => {
    completePicklist.mutate(id, {
      onSuccess: () => {
        toast.success("Picking selesai.")
        router.push(LIST_HREF)
      },
      onError: (e) => toast.error(errMsg(e, "Gagal menyelesaikan picking.")),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={pl ? `Picking - ${pl.picklistNo}` : "Proses Picking"}
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Picking", href: LIST_HREF },
          { label: "Proses Picking" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
              <ArrowLeftIcon /> Kembali
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!editable || !allPicked || completePicklist.isPending}
            >
              {completePicklist.isPending && <Loader2Icon className="animate-spin" />}
              Selesaikan Picking
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Memuat picklist…
        </div>
      ) : isError || !pl ? (
        <div className="py-24 text-center text-sm text-destructive">Gagal memuat picklist.</div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* ── Sidebar kiri ───────────────────────────────────────────── */}
          <aside className="flex flex-col gap-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">No Picklist</span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    PICKLIST_STATUS_LABEL[pl.status].className
                  )}
                >
                  {PICKLIST_STATUS_LABEL[pl.status].label}
                </span>
              </div>
              <div className="mt-1 font-mono text-sm font-semibold text-foreground">
                {pl.picklistNo}
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Lokasi</span>
                <span className="font-medium text-foreground">{pl.locationName ?? "—"}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>Picker</span>
                <span className="font-medium text-foreground">{pl.pickerName ?? "—"}</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span className="font-semibold tabular-nums text-foreground">
                  {totalPicked} / {totalOrdered}
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    allPicked ? "bg-emerald-500" : "bg-primary"
                  )}
                  style={{
                    width: `${
                      totalOrdered > 0
                        ? Math.min(100, Math.round((totalPicked / totalOrdered) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="text-xs text-muted-foreground">Kode Rak Aktif</div>
              <div className="mt-1 font-mono text-base font-semibold text-foreground">
                {scannedBinCode ?? "—"}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ScanBarcodeIcon className="size-4 text-muted-foreground" />
                <div className="text-sm font-medium">Ganti Rak</div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan kode rak yang menjadi sumber pengambilan berikutnya.
              </p>
              <div className="mt-3 flex h-20 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                <ScanBarcodeIcon className="size-8 text-muted-foreground/60" />
              </div>
              <Input
                ref={binScanRef}
                value={binScan}
                onChange={(e) => setBinScan(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleScanBin()
                  }
                }}
                placeholder="Scan kode rak…"
                className="mt-3"
                disabled={!editable}
              />
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <label htmlFor="picking-notes" className="text-xs text-muted-foreground">
                Keterangan
              </label>
              <Textarea
                id="picking-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan picking (opsional)…"
                className="mt-1.5 min-h-24"
              />
            </div>
          </aside>

          {/* ── Main kanan ───────────────────────────────────────────── */}
          <section className="flex flex-col gap-4">
            <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-border bg-card p-4">
              <div className="flex-1 min-w-[240px]">
                <label htmlFor="scan-sku" className="text-xs text-muted-foreground">
                  Scan SKU / Barcode
                </label>
                <div className="relative mt-1.5">
                  <ScanBarcodeIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="scan-sku"
                    ref={skuScanRef}
                    value={skuScan}
                    onChange={(e) => setSkuScan(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleScanSku()
                      }
                    }}
                    placeholder="Scan SKU / barcode barang…"
                    className="pl-9"
                    disabled={!editable || pickItem.isPending}
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 pl-1">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {totalPicked} / {totalOrdered}
                </span>
              </div>
            </div>

            {activeItem && (
              <div className="rounded-2xl border-2 border-primary bg-primary/[0.04] p-4">
                <div className="flex items-start gap-4">
                  <ItemImage src={activeItem.imageUrl} alt={activeItem.name ?? activeItem.sku} />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-foreground">{activeItem.name ?? activeItem.sku}</div>
                    <div className="font-mono text-xs text-muted-foreground">{activeItem.sku}</div>
                    <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                      <span>Pesanan: <span className="font-medium text-foreground">{activeItem.orderNo ?? "—"}</span></span>
                      <span>Dipesan: <span className="font-medium text-foreground">{activeItem.qtyOrdered}</span></span>
                      <span>Sudah pick: <span className="font-medium text-foreground">{activeItem.qtyPicked}</span></span>
                      <span>Sisa: <span className="font-semibold text-primary">{activeItem.qtyOrdered - activeItem.qtyPicked}</span></span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <label className="text-sm text-muted-foreground">Qty ambil:</label>
                  <Input
                    ref={qtyInputRef}
                    type="number"
                    min={1}
                    max={activeItem.qtyOrdered - activeItem.qtyPicked}
                    inputMode="numeric"
                    value={pickQty}
                    onChange={(e) => setPickQty(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleConfirmPick()
                      }
                    }}
                    className="h-9 w-24"
                    disabled={pickItem.isPending}
                  />
                  <Button onClick={handleConfirmPick} disabled={pickItem.isPending}>
                    {pickItem.isPending && <Loader2Icon className="size-4 animate-spin" />}
                    Konfirmasi
                  </Button>
                  <Button variant="ghost" onClick={handleCancelPick} disabled={pickItem.isPending}>
                    Batal
                  </Button>
                </div>
              </div>
            )}

            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              <table className="w-full min-w-[1100px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                    <th className="px-3 py-3 font-medium">Produk</th>
                    <th className="px-3 py-3 font-medium">Qty Pesan</th>
                    <th className="px-3 py-3 font-medium">Kode Rak</th>
                    <th className="px-3 py-3 font-medium">Qty Ambil / Pesan</th>
                    <th className="px-3 py-3 font-medium">No. Pesanan</th>
                    <th className="px-3 py-3 font-medium">No. Paket</th>
                    <th className="px-3 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium">No. Resi</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-sm text-muted-foreground">
                        Tidak ada item dalam picklist ini.
                      </td>
                    </tr>
                  ) : (
                    items.map((it) => {
                      const done = it.qtyPicked >= it.qtyOrdered
                      const badge = statusBadge(it.itemStatus, it.qtyPicked, it.qtyOrdered)
                      return (
                        <tr
                          key={it.id}
                          className={cn(
                            "border-b border-border/60 last:border-0",
                            done && "bg-emerald-500/[0.04]",
                            activeItemId === it.id && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20"
                          )}
                        >
                          <td className="px-3 py-3">
                            <div className="flex items-start gap-3">
                              <ItemImage src={it.imageUrl} alt={it.name ?? it.sku} />
                              <div className="flex min-w-0 flex-col gap-0.5">
                                <span className="font-medium text-foreground">
                                  {it.name ?? it.sku}
                                </span>
                                <span className="font-mono text-[11px] text-foreground/70">
                                  {it.sku}
                                </span>
                                {it.variantName && (
                                  <span className="text-[11px] text-muted-foreground">
                                    {it.variantName}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 tabular-nums text-foreground">
                            {it.qtyOrdered}
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-mono text-xs text-foreground">
                              {it.binCode ?? "—"}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex h-6 min-w-10 items-center justify-center rounded-md px-2 text-xs font-medium tabular-nums",
                                done
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : it.qtyPicked > 0
                                    ? "bg-amber-500/10 text-amber-600"
                                    : "text-muted-foreground"
                              )}
                            >
                              {it.qtyPicked} / {it.qtyOrdered}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-foreground">
                            {it.orderNo ?? "—"}
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-foreground">
                            {it.packageNo ?? "—"}
                          </td>
                          <td className="px-3 py-3">
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                badge.className
                              )}
                            >
                              {done && <CheckIcon className="size-3" />}
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-3 py-3 font-mono text-xs text-foreground">
                            {it.trackingNumber ?? "—"}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
