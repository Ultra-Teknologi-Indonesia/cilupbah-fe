"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import {
  ArrowLeftIcon,
  Loader2Icon,
  ScanLineIcon,
  QrCodeIcon,
  PackageIcon,
  Trash2Icon,
  CheckCircle2Icon,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { PageTitle } from "@/components/dashboard/page-title"
import {
  usePutawayDetail,
  usePutawayItems,
  useStartPutaway,
  useProcessPutawayItem,
} from "@/hooks/barang-masuk/use-putaway-actions"
import { PutawayService } from "@/services/barang-masuk/putaway.service"
import type { PutawayItem } from "@/types/barang-masuk/putaway"
import type { BinLookupResult } from "@/services/barang-masuk/putaway.service"

interface PutawayProcessViewProps {
  id: string
}

interface VirtualRow {
  virtualId: string
  itemId: string
  initialPutawayQty: number
}

export function PutawayProcessView({ id }: PutawayProcessViewProps) {
  const { data: putaway, isLoading, refetch: refetchDetail } = usePutawayDetail(id)
  const { data: items, refetch: refetchItems } = usePutawayItems(id)

  const startMutation = useStartPutaway()

  const [activeRack, setActiveRack] = useState<BinLookupResult | null>(null)
  const [rackInput, setRackInput] = useState("")
  const [rackLoading, setRackLoading] = useState(false)
  const [rackError, setRackError] = useState("")

  const [notes, setNotes] = useState("")
  const [scanCode, setScanCode] = useState("")
  const [scanError, setScanError] = useState("")
  const [focusItemId, setFocusItemId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [scannedItemIds, setScannedItemIds] = useState<Set<string>>(new Set())
  const [virtualRows, setVirtualRows] = useState<VirtualRow[]>([])

  const locationId = putaway?.location_id ?? ""

  useEffect(() => {
    if (putaway?.notes != null) setNotes(putaway.notes)
  }, [putaway?.notes])

  const isNotStarted = putaway?.status === "NOT_STARTED"
  const isInProgress = putaway?.status === "IN_PROGRESS"
  const isCompleted = putaway?.status === "COMPLETED"

  const allItems = useMemo<PutawayItem[]>(() => items ?? [], [items])

  const visibleList = useMemo<PutawayItem[]>(
    () => allItems.filter((it) => scannedItemIds.has(it.id) || it.putaway_qty > 0),
    [allItems, scannedItemIds]
  )

  const displayRows = useMemo(() => {
    const rows: { item: PutawayItem; key: string; isVirtual: boolean; virtualMaxQty?: number }[] = []
    for (const item of visibleList) {
      rows.push({ item, key: item.id, isVirtual: false })
      for (const vr of virtualRows.filter(v => v.itemId === item.id)) {
        rows.push({
          item,
          key: vr.virtualId,
          isVirtual: true,
          virtualMaxQty: item.qty - vr.initialPutawayQty,
        })
      }
    }
    return rows
  }, [visibleList, virtualRows])

  const removeVirtualRow = useCallback((virtualId: string) => {
    setVirtualRows(prev => prev.filter(v => v.virtualId !== virtualId))
  }, [])

  const { totalQty, placedQty } = useMemo(() => {
    return allItems.reduce(
      (acc, it) => {
        acc.totalQty += it.qty
        acc.placedQty += it.putaway_qty
        return acc
      },
      { totalQty: 0, placedQty: 0 }
    )
  }, [allItems])
  const progressPct = totalQty > 0 ? Math.round((placedQty / totalQty) * 100) : 0

  const handleLookupRack = useCallback(async () => {
    if (!rackInput.trim() || !locationId) return
    setRackLoading(true)
    setRackError("")
    try {
      const result = await PutawayService.lookupBin(rackInput.trim(), locationId)
      setActiveRack(result)
      setRackInput("")
    } catch (err) {
      setRackError((err as { message?: string })?.message || "Rak tidak ditemukan")
    } finally {
      setRackLoading(false)
    }
  }, [rackInput, locationId])

  const handleScan = useCallback(() => {
    const code = scanCode.trim().toLowerCase()
    if (!code) return
    const match = allItems.find((it) => {
      const remaining = it.qty - it.putaway_qty
      if (remaining <= 0) return false
      return [it.variant?.sku, it.product?.sku, it.serial_no, it.batch_no]
        .filter(Boolean)
        .some((v) => v!.toLowerCase() === code)
    })
    if (!match) {
      setScanError("Produk tidak ditemukan atau sudah selesai ditempatkan")
      return
    }
    setScanError("")
    setScannedItemIds((prev) => new Set(prev).add(match.id))
    if (match.putaway_qty > 0 && match.destination_bin_id) {
      const virtualId = `${match.id}-v-${Date.now()}`
      setVirtualRows(prev => [...prev, { virtualId, itemId: match.id, initialPutawayQty: match.putaway_qty }])
      setFocusItemId(virtualId)
    } else {
      setFocusItemId(match.id)
    }
    setScanCode("")
  }, [scanCode, allItems])

  const handleStart = useCallback(() => {
    startMutation.mutate(id, { onSuccess: () => refetchDetail() })
  }, [id, startMutation, refetchDetail])

  useEffect(() => {
    if (isNotStarted && putaway && !startMutation.isPending) {
      handleStart()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNotStarted, putaway?.id])

  const onProcessed = useCallback(() => {
    refetchItems()
    refetchDetail()
  }, [refetchItems, refetchDetail])

  useEffect(() => {
    setVirtualRows(prev => prev.filter(vr => {
      const item = allItems.find(it => it.id === vr.itemId)
      return item != null && item.qty > item.putaway_qty
    }))
  }, [allItems])

  const allSelectable = useMemo(
    () => visibleList.map((it) => it.id),
    [visibleList]
  )
  const allChecked = allSelectable.length > 0 && allSelectable.every((i) => selectedIds.has(i))
  const someChecked = allSelectable.some((i) => selectedIds.has(i))

  const toggleAll = useCallback(() => {
    setSelectedIds(allChecked ? new Set() : new Set(allSelectable))
  }, [allChecked, allSelectable])

  const toggleOne = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }, [])

  const statusLabel = isNotStarted
    ? "Belum Mulai"
    : isInProgress
      ? "Sedang Diproses"
      : isCompleted
        ? "Selesai"
        : (putaway?.status ?? "")

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={putaway ? `Penempatan - ${putaway.putaway_no}` : "Penempatan Barang"}
        backHref="/dashboard/barang-masuk/penempatan"
        breadcrumb={[
          { label: "Gudang", href: "/dashboard" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Penempatan Barang", href: "/dashboard/barang-masuk/penempatan" },
          ...(statusLabel ? [{ label: statusLabel }] : []),
          { label: putaway ? `Penempatan - ${putaway.putaway_no}` : "Memuat..." },
        ]}
      />

      {isLoading ? (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-6 dark:bg-white/[0.04]">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </LiquidGlass>
      ) : !putaway ? (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-6 dark:bg-white/[0.04]">
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm font-medium">Putaway tidak ditemukan</p>
            <Link href="/dashboard/barang-masuk/penempatan">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </LiquidGlass>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          {/* ── Sidebar: Kode Rak / Ganti Rak / Keterangan ───────────────── */}
          <aside className="flex w-full flex-col gap-5 lg:sticky lg:top-4 lg:w-64 lg:shrink-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Kode Rak
              </p>
              <p className="mt-1.5 text-lg font-bold text-foreground">
                {activeRack ? activeRack.bin_final_code : "Belum dipilih"}
              </p>
              {activeRack?.bin_label && (
                <p className="text-xs text-muted-foreground">{activeRack.bin_label}</p>
              )}
              {activeRack && activeRack.max_qty != null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Kapasitas: {activeRack.current_qty}/{activeRack.max_qty} (sisa {activeRack.remaining_capacity})
                </p>
              )}
            </div>

            {/* Ganti Rak — always visible like picking */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ScanLineIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Ganti Rak</div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan kode rak tujuan penempatan berikutnya.
              </p>
              <div className="mt-3 flex h-20 items-center justify-center rounded-xl border border-dashed border-border bg-muted/30">
                <QrCodeIcon className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.2} />
              </div>
              <Input
                placeholder="Scan kode rak…"
                value={rackInput}
                onChange={(e) => {
                  setRackInput(e.target.value)
                  setRackError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLookupRack()
                }}
                disabled={!isInProgress}
                className="mt-3"
              />
              {rackError && <p className="mt-1 text-xs text-red-500">{rackError}</p>}
            </div>

            <div>
              <Label htmlFor="putaway-notes" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Keterangan
              </Label>
              <Textarea
                id="putaway-notes"
                placeholder="Masukkan keterangan"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCompleted}
                className="mt-1.5 min-h-28 rounded-2xl text-sm"
              />
            </div>
          </aside>

          {/* ── Main: scan + progress + table ────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
              <div className="flex flex-col gap-4 px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <ScanLineIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Masukkan SKU/QR/Serial/Batch"
                      value={scanCode}
                      onChange={(e) => {
                        setScanCode(e.target.value)
                        setScanError("")
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleScan()
                      }}
                      disabled={!isInProgress}
                      className="h-11 rounded-xl pl-9"
                    />
                  </div>
                  <div className="flex min-w-44 flex-col gap-1.5 sm:w-56">
                    <span className="text-sm font-semibold tabular-nums">
                      {placedQty} / {totalQty} Qty
                    </span>
                    <Progress
                      value={progressPct}
                      className={cn("h-2.5", progressPct >= 100 && "[&_[data-slot=progress-indicator]]:bg-emerald-500")}
                    />
                  </div>
                </div>
                {scanError && <p className="-mt-1 text-xs text-red-500">{scanError}</p>}
              </div>
            </LiquidGlass>

            <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 pl-5">
                      <Checkbox
                        checked={allChecked ? true : someChecked ? "indeterminate" : false}
                        onCheckedChange={toggleAll}
                        disabled={!isInProgress || allSelectable.length === 0}
                        aria-label="Pilih semua"
                      />
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Produk
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Sumber
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Kode Rak
                    </TableHead>
                    <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Qty
                    </TableHead>
                    <TableHead className="w-12 pr-5" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="py-16 text-center">
                        {startMutation.isPending ? (
                          <div className="flex flex-col items-center gap-3">
                            <Loader2Icon className="h-6 w-6 animate-spin text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Memulai penempatan...</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Scan kode rak terlebih dahulu, lalu scan SKU produk.</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayRows.map((row) => (
                      <PutawayItemRow
                        key={row.key}
                        item={row.item}
                        putawayId={id}
                        locationId={locationId}
                        editable={isInProgress}
                        defaultRack={activeRack}
                        selected={selectedIds.has(row.item.id)}
                        onToggleSelect={() => toggleOne(row.item.id)}
                        highlighted={focusItemId === row.key}
                        onProcessed={onProcessed}
                        sourceRef={putaway?.inbound?.reference_number ?? putaway?.inbound?.transaction_number ?? "—"}
                        isVirtual={row.isVirtual}
                        virtualMaxQty={row.virtualMaxQty}
                        onRemoveVirtual={row.isVirtual ? () => removeVirtualRow(row.key) : undefined}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </LiquidGlass>

          </div>

        </div>
      )}
    </div>
  )
}

/* ── Row ───────────────────────────────────────────────────────────────── */

interface PutawayItemRowProps {
  item: PutawayItem
  putawayId: string
  locationId: string
  editable: boolean
  defaultRack: BinLookupResult | null
  selected: boolean
  onToggleSelect: () => void
  highlighted: boolean
  onProcessed: () => void
  sourceRef: string
  isVirtual?: boolean
  virtualMaxQty?: number
  onRemoveVirtual?: () => void
}

function PutawayItemRow({
  item,
  putawayId,
  locationId,
  editable,
  defaultRack,
  selected,
  onToggleSelect,
  highlighted,
  onProcessed,
  sourceRef,
  isVirtual = false,
  virtualMaxQty,
  onRemoveVirtual,
}: PutawayItemRowProps) {
  const processMutation = useProcessPutawayItem()
  const remaining = item.qty - item.putaway_qty
  const done = !isVirtual && remaining <= 0
  const qtyMax = isVirtual && virtualMaxQty != null ? virtualMaxQty : item.qty

  const [binCode, setBinCode] = useState(isVirtual ? "" : (item.destination_bin?.bin_final_code ?? ""))
  const [binResult, setBinResult] = useState<BinLookupResult | null>(null)
  const [binError, setBinError] = useState("")
  const [binLoading, setBinLoading] = useState(false)
  const [qty, setQty] = useState(isVirtual ? "" : (item.putaway_qty > 0 ? String(item.putaway_qty) : ""))

  const rowRef = useRef<HTMLTableRowElement>(null)
  const binInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastSavedQty = useRef(isVirtual ? 0 : item.putaway_qty)

  useEffect(() => {
    if (isVirtual) return
    lastSavedQty.current = item.putaway_qty
    if (item.putaway_qty > 0) setQty(String(item.putaway_qty))
    if (item.destination_bin?.bin_final_code && !binCode) {
      setBinCode(item.destination_bin.bin_final_code)
    }
  }, [item.putaway_qty, item.destination_bin?.bin_final_code, isVirtual])

  useEffect(() => {
    if (isVirtual) {
      if (defaultRack && !binResult) {
        setBinCode(defaultRack.bin_final_code)
        setBinResult(defaultRack)
      }
    } else if (defaultRack && !binResult && !binCode) {
      setBinCode(defaultRack.bin_final_code)
      setBinResult(defaultRack)
    }
  }, [defaultRack, binResult, binCode, isVirtual])

  useEffect(() => {
    if (highlighted) {
      rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      binInputRef.current?.focus()
    }
  }, [highlighted])

  useEffect(() => () => clearTimeout(autoSaveTimer.current), [])

  const saveNow = useCallback((bin: BinLookupResult, targetQty: number) => {
    const delta = targetQty - lastSavedQty.current
    if (delta <= 0 || processMutation.isPending) return
    processMutation.mutate(
      {
        putawayId,
        itemId: item.id,
        payload: { destination_bin_id: bin.id, qty: delta },
      },
      { onSuccess: () => { lastSavedQty.current = targetQty; onProcessed() } }
    )
  }, [processMutation, putawayId, item.id, onProcessed])

  useEffect(() => {
    clearTimeout(autoSaveTimer.current)
    const qtyNum = parseInt(qty) || 0
    const delta = qtyNum - lastSavedQty.current
    if (delta <= 0 || !binResult || processMutation.isPending) return

    autoSaveTimer.current = setTimeout(() => {
      saveNow(binResult, qtyNum)
    }, 800)

    return () => clearTimeout(autoSaveTimer.current)
  }, [qty, binResult, processMutation.isPending, saveNow])

  const lookupBin = useCallback(async () => {
    const code = binCode.trim()
    if (!code || !locationId) return
    if (defaultRack && code.toLowerCase() === defaultRack.bin_final_code.toLowerCase()) {
      setBinResult(defaultRack)
      return
    }
    setBinLoading(true)
    setBinError("")
    try {
      const result = await PutawayService.lookupBin(code, locationId)
      setBinResult(result)
    } catch (err) {
      setBinResult(null)
      setBinError((err as { message?: string })?.message || "Rak tidak ditemukan")
    } finally {
      setBinLoading(false)
    }
  }, [binCode, locationId, defaultRack])

  const productName = item.product?.product?.name ?? item.variant?.item_name ?? "—"
  const variantOptions = item.product?.options?.map((o) => o.value).join(" / ")
    ?? item.variant?.variation_values?.map((v) => v.value).join(" / ")
  const displayName = variantOptions ? `${productName} - ${variantOptions}` : productName
  const displaySku = item.variant?.sku ?? item.product?.sku ?? "—"
  const imageUrl = item.product?.media?.[0]?.url

  return (
    <TableRow
      ref={rowRef}
      data-state={selected ? "selected" : undefined}
      className={cn(
        highlighted && "bg-primary/5 ring-1 ring-inset ring-primary/30",
        done && "bg-emerald-50/50 dark:bg-emerald-950/20"
      )}
    >
      <TableCell className="pl-5">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          disabled={!editable}
          aria-label="Pilih item"
        />
      </TableCell>

      <TableCell className="max-w-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
            {imageUrl ? (
              <img src={imageUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              <PackageIcon className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground" title={displayName}>
              {displayName}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {displaySku}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <span className="font-mono text-xs font-medium text-foreground">
          {sourceRef}
        </span>
      </TableCell>

      <TableCell>
        {editable ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Input
                ref={binInputRef}
                value={binCode}
                placeholder="Kode rak"
                onChange={(e) => {
                  setBinCode(e.target.value)
                  setBinResult(null)
                  setBinError("")
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (binResult) {
                      clearTimeout(autoSaveTimer.current)
                      const qtyNum = parseInt(qty) || 0
                      if (qtyNum > lastSavedQty.current) saveNow(binResult, qtyNum)
                    } else lookupBin()
                  }
                }}
                className={cn(
                  "h-9 w-40 font-mono text-xs",
                  binResult && "border-emerald-300 ring-1 ring-emerald-200 dark:border-emerald-700 dark:ring-emerald-800"
                )}
              />
              {binLoading && <Loader2Icon className="h-4 w-4 animate-spin text-muted-foreground" />}
            </div>
            {binError && <p className="text-[11px] text-red-500">{binError}</p>}
            {binResult && binResult.remaining_capacity != null && (
              <p className="text-[11px] text-muted-foreground">
                Sisa: {binResult.remaining_capacity}/{binResult.max_qty}
              </p>
            )}
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>
        {editable ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={1}
                max={item.qty}
                value={qty}
                placeholder="0"
                onChange={(e) => {
                  const v = e.target.value
                  if (v === "") { setQty(""); return }
                  const n = parseInt(v) || 0
                  setQty(String(Math.max(0, Math.min(qtyMax, n))))
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && binResult) {
                    e.preventDefault()
                    clearTimeout(autoSaveTimer.current)
                    const qtyNum = parseInt(qty) || 0
                    if (qtyNum > lastSavedQty.current) saveNow(binResult, qtyNum)
                  }
                }}
                className="h-9 w-20 tabular-nums"
              />
              {processMutation.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin text-amber-500" />
              ) : item.putaway_qty > 0 ? (
                <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
              ) : null}
            </div>
            {!isVirtual && item.putaway_qty > 0 && (
              <p className="text-[11px] text-emerald-600">
                {item.putaway_qty}/{item.qty} ditempatkan
              </p>
            )}
            {isVirtual && virtualMaxQty != null && (
              <p className="text-[11px] text-muted-foreground">
                Sisa: {remaining > 0 ? remaining : 0}
              </p>
            )}
          </div>
        ) : (
          <span className="tabular-nums text-sm">{item.qty}</span>
        )}
      </TableCell>

      <TableCell className="pr-5">
        {editable && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              if (isVirtual && onRemoveVirtual) {
                onRemoveVirtual()
              } else {
                setBinCode("")
                setBinResult(null)
                setBinError("")
                setQty("")
              }
            }}
            className="text-muted-foreground hover:text-red-500"
            aria-label={isVirtual ? "Hapus baris" : "Bersihkan"}
            title={isVirtual ? "Hapus baris" : "Bersihkan baris"}
          >
            <Trash2Icon className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  )
}
