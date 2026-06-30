"use client"

import * as React from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  Loader2Icon,
  PackageIcon,
  ScanBarcodeIcon,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Combobox } from "@/components/ui/combobox"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  useCompletePacklist,
  usePackItem,
  usePacklistDetail,
  usePickers,
  useScanOrder,
  useStartPacklist,
  useVerifyBarcode,
} from "@/hooks/proses-pesanan/use-fulfillment"
import type { PacklistDetail, PacklistItem } from "@/types/proses-pesanan/fulfillment"

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

export function PackingProsesView() {
  const router = useRouter()

  const orderScanRef = React.useRef<HTMLInputElement>(null)
  const skuScanRef = React.useRef<HTMLInputElement>(null)
  const qtyInputRef = React.useRef<HTMLInputElement>(null)

  const [pickerId, setPickerId] = React.useState<string | null>(null)
  const [orderScan, setOrderScan] = React.useState("")
  const [skuScan, setSkuScan] = React.useState("")
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null)
  const [packQty, setPackQty] = React.useState("")

  const [packlistId, setPacklistId] = React.useState<string | null>(null)

  const pickers = usePickers(undefined, "packer")
  const scanOrder = useScanOrder()
  const startPacklist = useStartPacklist()
  const packItem = usePackItem()
  const verifyBarcode = useVerifyBarcode()
  const completePacklist = useCompletePacklist()

  const { data: pk, isLoading: pkLoading } = usePacklistDetail(packlistId ?? "", !!packlistId)

  const selectedPicker = pickers.data?.find((p) => p.id === pickerId) ?? null
  const items = pk?.items ?? []
  const totalOrdered = items.reduce((s, i) => s + i.qtyOrdered, 0)
  const totalPacked = items.reduce((s, i) => s + i.qtyPacked, 0)
  const allPacked = items.length > 0 && items.every((i) => i.qtyPacked >= i.qtyOrdered)

  const didAutoComplete = React.useRef(false)
  React.useEffect(() => {
    if (!pk || didAutoComplete.current || !packlistId) return
    if (allPacked && pk.status !== "COMPLETED") {
      didAutoComplete.current = true
      completePacklist.mutate(packlistId, {
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
  }, [pk, allPacked, packlistId, completePacklist, router])

  const handleScanOrder = async () => {
    const code = orderScan.trim()
    if (!code) return
    if (!pickerId) {
      toast.warning("Pilih packer terlebih dahulu.")
      return
    }
    setOrderScan("")

    const result = await scanOrder.mutateAsync({ orderNo: code, packerId: pickerId })
    if (!result) {
      toast.error(`Pesanan "${code}" tidak ditemukan atau belum siap packing.`)
      orderScanRef.current?.focus()
      return
    }

    if (result.status === "DRAFT") {
      try {
        await startPacklist.mutateAsync(result.id)
      } catch {
        // start optional, continue
      }
    }

    setPacklistId(result.id)
    didAutoComplete.current = false
    toast.success(`Packlist ${result.packlistNo} dimuat.`)
    setTimeout(() => skuScanRef.current?.focus(), 100)
  }

  const activeItem = activeItemId ? items.find((i) => i.id === activeItemId) ?? null : null

  const handleScanSku = () => {
    const code = skuScan.trim()
    if (!code || !packlistId) return
    setSkuScan("")

    const item = items.find(
      (i) => i.sku.toLowerCase() === code.toLowerCase() && i.qtyPacked < i.qtyOrdered
    ) ?? items.find((i) => i.sku.toLowerCase() === code.toLowerCase())

    if (!item) {
      verifyBarcode.mutate(
        { packlistId, barcode: code },
        {
          onSuccess: (res) => {
            if (!res) {
              toast.error(`SKU/Barcode "${code}" tidak ditemukan.`)
              return
            }
            const matched = items.find((i) => i.id === res.itemId)
            if (matched && matched.qtyPacked < matched.qtyOrdered) {
              setActiveItemId(matched.id)
              setPackQty("")
              setTimeout(() => qtyInputRef.current?.focus(), 50)
            } else {
              toast.info(`${res.sku} sudah lengkap.`)
            }
          },
          onError: (e) => toast.error(errMsg(e, "Barcode tidak valid.")),
        }
      )
      return
    }

    if (item.qtyPacked >= item.qtyOrdered) {
      toast.info(`${item.sku} sudah lengkap.`)
      skuScanRef.current?.focus()
      return
    }

    setActiveItemId(item.id)
    setPackQty("")
    setTimeout(() => qtyInputRef.current?.focus(), 50)
  }

  const handleConfirmPack = () => {
    if (!activeItem || !packlistId) return
    const qty = Number.parseInt(packQty, 10)
    const remaining = activeItem.qtyOrdered - activeItem.qtyPacked
    if (Number.isNaN(qty) || qty <= 0) {
      toast.error("Masukkan qty yang valid.")
      return
    }
    if (qty > remaining) {
      toast.error(`Qty melebihi sisa (${remaining}).`)
      return
    }
    packItem.mutate(
      {
        packlistId,
        itemId: activeItem.id,
        qtyPacked: activeItem.qtyPacked + qty,
        barcodeVerified: true,
      },
      {
        onSuccess: () => {
          toast.success(`${activeItem.sku} dikemas (${activeItem.qtyPacked + qty}/${activeItem.qtyOrdered}).`)
          setActiveItemId(null)
          setPackQty("")
          skuScanRef.current?.focus()
        },
        onError: (e) => toast.error(errMsg(e, `Gagal pack ${activeItem.sku}.`)),
      }
    )
  }

  const handleCancelPack = () => {
    setActiveItemId(null)
    setPackQty("")
    skuScanRef.current?.focus()
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
          {/* Packer + Order scan */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Packer</label>
                <div className="mt-1.5">
                  <Combobox
                    options={(pickers.data ?? []).map((p) => ({
                      value: p.id,
                      label: p.name,
                      hint: p.email ?? undefined,
                    }))}
                    value={pickerId}
                    onChange={setPickerId}
                    placeholder="Pilih packer…"
                    searchPlaceholder="Cari packer…"
                    emptyText="Packer tidak ditemukan."
                    disabled={!!packlistId}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Scan No. Pesanan / Resi
                </label>
                <div className="relative mt-1.5">
                  <ScanBarcodeIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={orderScanRef}
                    value={orderScan}
                    onChange={(e) => setOrderScan(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleScanOrder()
                      }
                    }}
                    placeholder="Scan atau ketik no. pesanan…"
                    className="pl-9"
                    disabled={!pickerId || scanOrder.isPending || !!packlistId}
                  />
                </div>
              </div>
            </div>

            {pk && (
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border/60 pt-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">Packlist</span>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs"
                  onClick={() => {
                    setPacklistId(null)
                    setActiveItemId(null)
                    didAutoComplete.current = false
                    setTimeout(() => orderScanRef.current?.focus(), 50)
                  }}
                >
                  Ganti Pesanan
                </Button>
              </div>
            )}
          </div>

          {/* SKU scan */}
          {packlistId && (
            <div className="rounded-2xl border border-border bg-card p-4">
              <label className="text-xs font-medium text-muted-foreground">
                Scan SKU / Barcode Produk
              </label>
              <div className="relative mt-1.5">
                <ScanBarcodeIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={skuScanRef}
                  value={skuScan}
                  onChange={(e) => setSkuScan(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleScanSku()
                    }
                  }}
                  placeholder="Scan SKU / barcode lalu Enter…"
                  className="pl-9"
                  disabled={packItem.isPending}
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Modal konfirmasi qty pack */}
          <Dialog open={!!activeItem} onOpenChange={(open) => { if (!open) handleCancelPack() }}>
            <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => { e.preventDefault(); setTimeout(() => qtyInputRef.current?.focus(), 50) }}>
              {activeItem && (
                <>
                  <DialogHeader>
                    <DialogTitle>Konfirmasi Pack</DialogTitle>
                    <DialogDescription>Masukkan jumlah yang dikemas</DialogDescription>
                  </DialogHeader>
                  <div className="flex items-start gap-4 py-2">
                    <ItemImage src={activeItem.imageUrl} alt={activeItem.description ?? activeItem.sku} size={56} />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-foreground">{activeItem.description ?? activeItem.sku}</div>
                      <div className="font-mono text-xs text-muted-foreground">{activeItem.sku}</div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Qty dipesan</span>
                        <span className="font-medium text-foreground">{activeItem.qtyOrdered}</span>
                        <span>Sudah pack</span>
                        <span className="font-medium text-foreground">{activeItem.qtyPacked}</span>
                        <span>Sisa</span>
                        <span className="font-semibold text-primary">{activeItem.qtyOrdered - activeItem.qtyPacked}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="shrink-0 text-sm font-medium text-foreground">Qty kemas</label>
                    <Input
                      ref={qtyInputRef}
                      type="number"
                      min={1}
                      max={activeItem.qtyOrdered - activeItem.qtyPacked}
                      inputMode="numeric"
                      value={packQty}
                      onChange={(e) => setPackQty(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleConfirmPack()
                        }
                      }}
                      placeholder={`maks ${activeItem.qtyOrdered - activeItem.qtyPacked}`}
                      className="h-10"
                      disabled={packItem.isPending}
                    />
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={handleCancelPack} disabled={packItem.isPending}>
                      Batal
                    </Button>
                    <Button onClick={handleConfirmPack} disabled={packItem.isPending || !packQty.trim()}>
                      {packItem.isPending && <Loader2Icon className="size-4 animate-spin" />}
                      Konfirmasi Pack
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>

          {/* Items table */}
          {packlistId && (
            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
              {pkLoading ? (
                <div className="flex items-center justify-center gap-2 py-16">
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Memuat item…</span>
                </div>
              ) : items.length === 0 ? (
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
          )}

          {/* Empty state */}
          {!packlistId && (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 py-20">
              <div className="flex size-16 items-center justify-center rounded-full bg-muted/60">
                <ScanBarcodeIcon className="size-8 text-muted-foreground/60" />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-semibold">Siap untuk packing</p>
                <p className="text-xs text-muted-foreground">
                  Pilih packer, lalu scan no. pesanan atau resi untuk memulai.
                </p>
              </div>
            </div>
          )}
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
