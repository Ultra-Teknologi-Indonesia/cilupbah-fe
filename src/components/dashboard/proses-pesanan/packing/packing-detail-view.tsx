"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PackageIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScanAutoflowBar, type ScanAutoflowLine } from "@/components/dashboard/shared/scan-autoflow-bar"
import { PageTitle } from "@/components/dashboard/page-title"
import { playScanFeedback } from "@/lib/scan-feedback"
import { type PacklistItem } from "@/types/proses-pesanan/fulfillment"
import {
  useCompletePacklist,
  usePackItem,
  usePacklistDetail,
  useStartPacklist,
  useVerifyBarcode,
} from "@/hooks/proses-pesanan/use-fulfillment"

const LIST_HREF = "/dashboard/proses-pesanan"

function errMsg(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message
    if (typeof m === "string" && m) return m
  }
  return fallback
}

function ItemImage({ src, alt, size = 48 }: { src: string | null; alt: string; size?: number }) {
  const [errored, setErrored] = React.useState(false)
  if (!src || errored) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground"
        style={{ width: size, height: size }}
      >
        <PackageIcon className="size-5" />
      </div>
    )
  }
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted"
      style={{ width: size, height: size }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setErrored(true)}
      />
    </div>
  )
}

function ProgressBar({ packed, total }: { packed: number; total: number }) {
  const pct = total > 0 ? Math.min(100, Math.round((packed / total) * 100)) : 0
  const done = packed >= total && total > 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold tabular-nums text-foreground">
          {packed} / {total}
        </span>
        <span className="text-xs text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            done ? "bg-emerald-500" : "bg-primary"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PackingDetailView({ id }: { id: string }) {
  const router = useRouter()

  const qtyInputRef = React.useRef<HTMLInputElement>(null)

  const [activeItemId, setActiveItemId] = React.useState<string | null>(null)
  const [packQty, setPackQty] = React.useState("")
  const [scanFocusKey, setScanFocusKey] = React.useState(0)
  const refocusScan = () => setScanFocusKey((k) => k + 1)

  const { data: pk, isLoading, isError } = usePacklistDetail(id)
  const startPacklist = useStartPacklist()
  const packItem = usePackItem()
  const verifyBarcode = useVerifyBarcode()
  const completePacklist = useCompletePacklist()

  const items = pk?.items ?? []
  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0)
  const totalPacked = items.reduce((s, i) => s + i.qtyPacked, 0)
  const allPacked = items.length > 0 && items.every((i) => i.qtyPacked >= i.qtyOrdered)
  const isTerminal = pk ? ["COMPLETED", "CANCELLED"].includes(pk.status) : false
  const editable = !!pk && !isTerminal

  const didAutoComplete = React.useRef(false)
  React.useEffect(() => {
    if (!pk || didAutoComplete.current) return
    if (allPacked && pk.status !== "COMPLETED") {
      didAutoComplete.current = true
      completePacklist.mutate(id, {
        onSuccess: () => {
          toast.success("Semua item sudah dikemas. Packing selesai!")
          router.push(LIST_HREF)
        },
        onError: (e) => {
          didAutoComplete.current = false
          toast.error(errMsg(e, "Gagal menyelesaikan packing."))
        },
      })
    }
  }, [pk, allPacked, id, completePacklist, router])

  React.useEffect(() => {
    if (pk && pk.status === "DRAFT") {
      startPacklist.mutate(id, {
        onError: () => {},
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pk?.id])

  const activeItem = activeItemId ? items.find((i) => i.id === activeItemId) ?? null : null

  const scanLines: ScanAutoflowLine[] = items.map((i) => ({
    id: i.id,
    primary: i.description ?? i.sku,
    secondary: i.sku,
    codes: [i.sku],
    done: i.qtyPacked >= i.qtyOrdered,
  }))

  const packNow = (item: PacklistItem, absoluteQty: number) => {
    packItem.mutate(
      { packlistId: id, itemId: item.id, qtyPacked: absoluteQty, barcodeVerified: true },
      {
        onSuccess: () => {
          toast.success(`${item.sku} dikemas (${absoluteQty}/${item.qtyOrdered}).`)
          setActiveItemId(null)
          setPackQty("")
          refocusScan()
        },
        onError: (e) => { toast.error(errMsg(e, `Gagal pack ${item.sku}.`)); playScanFeedback("error") },
      }
    )
  }

  const openQtyFor = (item: PacklistItem) => {
    const remaining = item.qtyOrdered - item.qtyPacked
    setActiveItemId(item.id)
    setPackQty(String(remaining))
    setTimeout(() => { qtyInputRef.current?.focus(); qtyInputRef.current?.select() }, 50)
  }

  // qty=1 → pack otomatis (nol keyboard); qty>1 → input qty muncul default = sisa, Enter.
  const packOrPrompt = (item: PacklistItem) => {
    const remaining = item.qtyOrdered - item.qtyPacked
    if (remaining <= 0) { toast.info(`${item.sku} sudah lengkap.`); refocusScan(); return }
    if (remaining === 1) { packNow(item, item.qtyPacked + 1); return }
    openQtyFor(item)
  }

  const handleResolve = (line: ScanAutoflowLine) => {
    const item = items.find((i) => i.id === line.id)
    if (item) packOrPrompt(item)
  }

  // Kode tak cocok lokal → verifikasi barcode ke BE (barcode ≠ SKU).
  const handleUnmatched = (code: string) => {
    if (!id) return
    verifyBarcode.mutate(
      { packlistId: id, barcode: code },
      {
        onSuccess: (res) => {
          if (!res) { toast.error(`SKU/Barcode "${code}" tidak ditemukan.`); playScanFeedback("error"); return }
          const matched = items.find((i) => i.id === res.itemId)
          if (matched) { playScanFeedback("ok"); packOrPrompt(matched) }
          else { toast.info(`${res.sku} sudah lengkap.`); playScanFeedback("error") }
        },
        onError: (e) => { toast.error(errMsg(e, "Barcode tidak valid.")); playScanFeedback("error") },
      }
    )
  }

  const handleConfirmPack = () => {
    if (!activeItem) return
    const qty = Number.parseInt(packQty, 10)
    const remaining = activeItem.qtyOrdered - activeItem.qtyPacked
    if (Number.isNaN(qty) || qty <= 0) { toast.error("Masukkan qty yang valid."); return }
    if (qty > remaining) { toast.error(`Qty melebihi sisa (${remaining}).`); return }
    packNow(activeItem, activeItem.qtyPacked + qty)
  }

  const handleCancelPack = () => {
    setActiveItemId(null)
    setPackQty("")
    refocusScan()
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Proses Packing"
          breadcrumb={[
            { label: "Gudang" },
            { label: "Proses Pesanan", href: LIST_HREF },
            { label: "Packing" },
            { label: "Proses Packing" },
          ]}
          actions={
            <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
              <ArrowLeftIcon /> Kembali
            </Button>
          }
        />
        <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" /> Memuat packlist…
        </div>
      </div>
    )
  }

  if (isError || !pk) {
    return (
      <div className="flex flex-col gap-6">
        <PageTitle
          title="Proses Packing"
          breadcrumb={[
            { label: "Gudang" },
            { label: "Proses Pesanan", href: LIST_HREF },
            { label: "Packing" },
            { label: "Proses Packing" },
          ]}
          actions={
            <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
              <ArrowLeftIcon /> Kembali
            </Button>
          }
        />
        <div className="py-24 text-center text-sm text-destructive">Gagal memuat packlist.</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Proses Packing"
        breadcrumb={[
          { label: "Gudang" },
          { label: "Proses Pesanan", href: LIST_HREF },
          { label: "Packing" },
          { label: "Proses Packing" },
        ]}
        actions={
          <Button variant="outline" onClick={() => router.push(LIST_HREF)}>
            <ArrowLeftIcon /> Kembali
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        {/* ── Main content ─────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Packlist info */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <div>
                <span className="text-xs text-muted-foreground">No. Packing</span>
                <div className="font-mono font-semibold">{pk.packlistNo}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Pesanan</span>
                <div className="font-medium">{pk.orderNo ?? "—"}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Customer</span>
                <div className="font-medium">{pk.customerName ?? "—"}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Packer</span>
                <div className="font-medium">{pk.packerName ?? "—"}</div>
              </div>
            </div>
          </div>

          {/* Scan / pilih manual — unified autoflow */}
          {editable && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <label className="text-xs font-medium text-muted-foreground">
                Scan SKU / Barcode Produk
              </label>
              <ScanAutoflowBar
                lines={scanLines}
                onResolve={handleResolve}
                onUnmatched={handleUnmatched}
                disabled={packItem.isPending}
                refocusKey={scanFocusKey}
                hint="Scan barcode/SKU — qty 1 otomatis; qty >1 masukkan jumlah lalu Enter."
                className="mt-1.5"
              />
            </div>
          )}

          {/* Input qty inline untuk item qty > 1 (default = sisa, Enter = simpan) */}
          {activeItem && (
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <ItemImage src={activeItem.imageUrl} alt={activeItem.description ?? activeItem.sku} size={48} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{activeItem.description ?? activeItem.sku}</div>
                <div className="font-mono text-xs text-muted-foreground">{activeItem.sku}</div>
                <div className="text-xs text-muted-foreground">
                  Sisa {activeItem.qtyOrdered - activeItem.qtyPacked} · sudah {activeItem.qtyPacked}/{activeItem.qtyOrdered}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium">Qty kemas</label>
                <Input
                  ref={qtyInputRef}
                  type="number"
                  min={1}
                  max={activeItem.qtyOrdered - activeItem.qtyPacked}
                  inputMode="numeric"
                  value={packQty}
                  onChange={(e) => setPackQty(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirmPack() } }}
                  className="h-10 w-28 text-base"
                  disabled={packItem.isPending}
                />
              </div>
              <Button onClick={handleConfirmPack} disabled={packItem.isPending || !packQty.trim()}>
                {packItem.isPending && <Loader2Icon className="mr-1 size-4 animate-spin" />}
                Simpan
              </Button>
              <Button variant="ghost" onClick={handleCancelPack} disabled={packItem.isPending}>Batal</Button>
            </div>
          )}

          {/* Items table */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            {items.length === 0 ? (
              <div className="py-16 text-center text-sm text-muted-foreground">
                Tidak ada item dalam packlist ini.
              </div>
            ) : (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Produk</th>
                    <th className="px-4 py-3 font-medium text-center">QTY Pesanan</th>
                    <th className="px-4 py-3 font-medium text-center">QTY Pack</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const done = item.qtyPacked >= item.qtyOrdered
                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "border-b border-border/60 last:border-0 transition-colors",
                          done && "bg-emerald-500/[0.04]",
                          activeItemId === item.id && "bg-primary/[0.06] ring-1 ring-inset ring-primary/20"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <ItemImage src={item.imageUrl} alt={item.description ?? item.sku} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-foreground truncate">
                                {item.description ?? item.sku}
                              </p>
                              <p className="font-mono text-[11px] text-muted-foreground">{item.sku}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center tabular-nums font-medium text-foreground">
                          {item.qtyOrdered}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "inline-flex h-7 min-w-12 items-center justify-center rounded-lg px-2.5 text-sm font-semibold tabular-nums",
                              done
                                ? "bg-emerald-500/10 text-emerald-600"
                                : item.qtyPacked > 0
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-muted text-muted-foreground"
                            )}
                          >
                            {item.qtyPacked}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {done ? (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                              <CheckCircle2Icon className="size-3.5" /> Selesai
                            </span>
                          ) : item.qtyPacked > 0 ? (
                            <span className="text-xs font-medium text-amber-600">
                              Sisa {item.qtyOrdered - item.qtyPacked}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Belum</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Sidebar: progress + images ──────────────────── */}
        <aside className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-4">
            <ProgressBar packed={totalPacked} total={totalOrdered} />
          </div>

          {items.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-xs font-medium text-muted-foreground">Produk dalam paket</p>
              <div className="grid grid-cols-3 gap-2">
                {items.map((item) => {
                  const done = item.qtyPacked >= item.qtyOrdered
                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "relative overflow-hidden rounded-xl border-2 transition-colors",
                        done ? "border-emerald-500/40" : "border-border/60"
                      )}
                    >
                      <ItemImage src={item.imageUrl} alt={item.description ?? item.sku} size={96} />
                      {done && (
                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20">
                          <CheckCircle2Icon className="size-6 text-emerald-600" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1.5">
                        <p className="truncate text-[10px] font-medium text-white">
                          {item.qtyPacked}/{item.qtyOrdered}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
