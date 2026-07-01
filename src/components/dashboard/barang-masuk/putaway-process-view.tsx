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
  ChevronDownIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react"
import Link from "next/link"

import { QRCodeSVG } from "qrcode.react"
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
import { Combobox } from "@/components/ui/combobox"
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

interface PlacementEntry {
  id: string
  initialSavedQty: number
  initialBinCode: string
  initialBinQty: number
  maxQty: number
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [scannedItemIds, setScannedItemIds] = useState<Set<string>>(new Set())

  const [itemPlacements, setItemPlacements] = useState<Record<string, PlacementEntry[]>>({})
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [focusPlacementId, setFocusPlacementId] = useState<string | null>(null)

  const scanInputRef = useRef<HTMLInputElement>(null)
  const rackInputRef = useRef<HTMLInputElement>(null)

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
      setTimeout(() => scanInputRef.current?.focus(), 50)
    } catch (err) {
      setRackError((err as { message?: string })?.message || "Rak tidak ditemukan")
    } finally {
      setRackLoading(false)
    }
  }, [rackInput, locationId])

  const handleScan = useCallback(() => {
    const code = scanCode.trim().replace(/\s+/g, "").toLowerCase()
    if (!code) return
    const match = allItems.find((it) => {
      const remaining = it.qty - it.putaway_qty
      if (remaining <= 0) return false
      return [it.variant?.sku, it.product?.sku, it.serial_no, it.batch_no]
        .filter(Boolean)
        .some((v) => v!.replace(/\s+/g, "").toLowerCase() === code)
    })
    if (!match) {
      setScanError("Produk tidak ditemukan atau sudah selesai ditempatkan")
      return
    }
    setScanError("")
    setScannedItemIds((prev) => new Set(prev).add(match.id))

    const newId = `${match.id}-p-${Date.now()}`
    const newEntry: PlacementEntry = {
      id: newId,
      initialSavedQty: 0,
      initialBinCode: "",
      initialBinQty: 0,
      maxQty: match.qty - match.putaway_qty,
    }

    setItemPlacements((prev) => {
      const existing = prev[match.id]
      if (existing) {
        return { ...prev, [match.id]: [...existing, newEntry] }
      }
      const entries: PlacementEntry[] = []
      const apiPlacements = match.placements ?? []
      if (apiPlacements.length > 0) {
        for (const p of apiPlacements) {
          entries.push({
            id: `${match.id}-existing-${p.bin_id}`,
            initialSavedQty: p.qty,
            initialBinCode: p.bin?.bin_final_code ?? "",
            initialBinQty: p.qty,
            maxQty: match.qty,
          })
        }
      } else if (match.putaway_qty > 0 && match.destination_bin) {
        entries.push({
          id: `${match.id}-existing`,
          initialSavedQty: match.putaway_qty,
          initialBinCode: match.destination_bin.bin_final_code,
          initialBinQty: match.putaway_qty,
          maxQty: match.qty,
        })
      }
      entries.push(newEntry)
      return { ...prev, [match.id]: entries }
    })

    setExpandedItems((prev) => new Set(prev).add(match.id))
    setFocusPlacementId(newId)
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

  const handleScanSaved = useCallback(() => {
    setTimeout(() => rackInputRef.current?.focus(), 50)
  }, [])

  const toggleExpand = useCallback((itemId: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) next.delete(itemId)
      else next.add(itemId)
      return next
    })
  }, [])

  const removePlacement = useCallback((itemId: string, placementId: string) => {
    setItemPlacements((prev) => {
      const list = prev[itemId]?.filter((p) => p.id !== placementId)
      if (!list || list.length === 0) {
        const { [itemId]: _, ...rest } = prev
        return rest
      }
      return { ...prev, [itemId]: list }
    })
  }, [])

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

  const unscannedOptions = useMemo(() => {
    return allItems
      .filter((it) => !scannedItemIds.has(it.id) && it.putaway_qty <= 0)
      .map((it) => {
        const sku = it.variant?.sku ?? it.product?.sku ?? "—"
        const opts = it.product?.options?.map((o) => o.value).join(" / ")
          ?? it.variant?.variation_values?.map((v) => v.value).join(" / ")
        return {
          value: it.id,
          label: opts ? `${sku} — ${opts}` : sku,
          hint: `${it.qty}`,
        }
      })
  }, [allItems, scannedItemIds])

  const handleManualAdd = useCallback((itemId: string | null) => {
    if (!itemId) return
    const match = allItems.find((it) => it.id === itemId)
    if (!match) return

    setScannedItemIds((prev) => new Set(prev).add(match.id))

    const newId = `${match.id}-p-${Date.now()}`
    const newEntry: PlacementEntry = {
      id: newId,
      initialSavedQty: 0,
      initialBinCode: "",
      initialBinQty: 0,
      maxQty: match.qty - match.putaway_qty,
    }

    setItemPlacements((prev) => {
      const existing = prev[match.id]
      if (existing) {
        return { ...prev, [match.id]: [...existing, newEntry] }
      }
      return { ...prev, [match.id]: [newEntry] }
    })

    setExpandedItems((prev) => new Set(prev).add(match.id))
    setFocusPlacementId(newId)
  }, [allItems])

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
          {/* ── Sidebar ─────────────────────────────────────────────────── */}
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

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <ScanLineIcon className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm font-medium">Ganti Rak</div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Scan kode rak tujuan penempatan berikutnya.
              </p>
              <div className="mt-3 flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 p-3">
                {activeRack ? (
                  <QRCodeSVG value={activeRack.bin_final_code} size={72} />
                ) : (
                  <QrCodeIcon className="h-8 w-8 text-muted-foreground/60" strokeWidth={1.2} />
                )}
              </div>
              <Input
                ref={rackInputRef}
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

          {/* ── Main ────────────────────────────────────────────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
              <div className="flex flex-col gap-4 px-5 py-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <ScanLineIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      ref={scanInputRef}
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
                  {unscannedOptions.length > 0 && isInProgress && (
                    <Combobox
                      options={unscannedOptions}
                      value={null}
                      onChange={handleManualAdd}
                      placeholder="+ Tambah Item"
                      searchPlaceholder="Cari SKU / varian…"
                      emptyText="Semua item sudah ditambahkan."
                      className="h-11 w-auto min-w-44 shrink-0 rounded-xl"
                    />
                  )}
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
                      Qty
                    </TableHead>
                    <TableHead className="w-12 pr-5" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleList.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={5} className="py-16 text-center">
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
                    visibleList.map((item) => (
                      <PutawayItemRow
                        key={item.id}
                        item={item}
                        putawayId={id}
                        locationId={locationId}
                        editable={isInProgress}
                        defaultRack={activeRack}
                        selected={selectedIds.has(item.id)}
                        onToggleSelect={() => toggleOne(item.id)}
                        onProcessed={onProcessed}
                        sourceRef={putaway?.inbound?.reference_number ?? putaway?.inbound?.transaction_number ?? "—"}
                        placements={itemPlacements[item.id] ?? []}
                        expanded={expandedItems.has(item.id)}
                        onToggleExpand={() => toggleExpand(item.id)}
                        focusPlacementId={focusPlacementId}
                        onRemovePlacement={(pid) => removePlacement(item.id, pid)}
                        onSaved={handleScanSaved}
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

/* ── Accordion Row ────────────────────────────────────────────────────── */

interface PutawayItemRowProps {
  item: PutawayItem
  putawayId: string
  locationId: string
  editable: boolean
  defaultRack: BinLookupResult | null
  selected: boolean
  onToggleSelect: () => void
  onProcessed: () => void
  sourceRef: string
  placements: PlacementEntry[]
  expanded: boolean
  onToggleExpand: () => void
  focusPlacementId: string | null
  onRemovePlacement: (id: string) => void
  onSaved?: () => void
}

function PutawayItemRow({
  item,
  putawayId,
  locationId,
  editable,
  defaultRack,
  selected,
  onToggleSelect,
  onProcessed,
  sourceRef,
  placements,
  expanded,
  onToggleExpand,
  focusPlacementId,
  onRemovePlacement,
  onSaved,
}: PutawayItemRowProps) {
  const remaining = item.qty - item.putaway_qty
  const done = remaining <= 0

  const effectivePlacements = useMemo(() => {
    if (placements.length > 0) return placements
    const apiPlacements = item.placements ?? []
    if (apiPlacements.length > 0) {
      return apiPlacements.map((p) => ({
        id: `auto-${p.bin_id}`,
        initialSavedQty: p.qty,
        initialBinCode: p.bin?.bin_final_code ?? "",
        initialBinQty: p.qty,
        maxQty: item.qty,
      }))
    }
    if (item.putaway_qty > 0 && item.destination_bin) {
      return [{
        id: "auto",
        initialSavedQty: item.putaway_qty,
        initialBinCode: item.destination_bin.bin_final_code,
        initialBinQty: item.putaway_qty,
        maxQty: item.qty,
      }]
    }
    return []
  }, [placements, item.placements, item.putaway_qty, item.destination_bin, item.qty])

  const productName = item.product?.product?.name ?? item.variant?.item_name ?? "—"
  const variantOptions = item.product?.options?.map((o) => o.value).join(" / ")
    ?? item.variant?.variation_values?.map((v) => v.value).join(" / ")
  const displayName = variantOptions ? `${productName} - ${variantOptions}` : productName
  const displaySku = item.variant?.sku ?? item.product?.sku ?? "—"
  const imageUrl = item.product?.media?.[0]?.url

  return (
    <>
      <TableRow
        data-state={selected ? "selected" : undefined}
        className={cn(
          done && "bg-emerald-50/50 dark:bg-emerald-950/20",
          expanded && effectivePlacements.length > 0 && "border-b-0"
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
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold tabular-nums">
              {item.putaway_qty} / {item.qty}
            </span>
            <span className={cn("text-[11px]", done ? "text-emerald-600 font-medium" : "text-muted-foreground")}>
              {done ? "Selesai" : item.putaway_qty > 0 ? "ditempatkan" : "belum ditempatkan"}
            </span>
          </div>
        </TableCell>

        <TableCell className="pr-5">
          {effectivePlacements.length > 0 ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onToggleExpand}
              className="text-muted-foreground"
              aria-label={expanded ? "Tutup detail" : "Lihat detail"}
            >
              {expanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          ) : null}
        </TableCell>
      </TableRow>

      {expanded && effectivePlacements.length > 0 && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="border-t-0 pb-4 pl-16 pr-5 pt-0">
            <div className="flex flex-col gap-2 rounded-xl border border-border/50 bg-muted/20 p-3">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Detail Penempatan
              </p>
              {effectivePlacements.map((entry) => (
                <PlacementRow
                  key={entry.id}
                  item={item}
                  putawayId={putawayId}
                  locationId={locationId}
                  defaultRack={defaultRack}
                  editable={editable}
                  onProcessed={onProcessed}
                  entry={entry}
                  focusTarget={focusPlacementId === entry.id ? (defaultRack ? "qty" : "bin") : null}
                  onSaved={onSaved}
                  onRemove={
                    placements.length > 0 && !entry.id.endsWith("-existing") && entry.id !== "auto"
                      ? () => onRemovePlacement(entry.id)
                      : undefined
                  }
                />
              ))}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

/* ── Placement Row (bin + qty + auto-save) ────────────────────────────── */

interface PlacementRowProps {
  item: PutawayItem
  putawayId: string
  locationId: string
  defaultRack: BinLookupResult | null
  editable: boolean
  onProcessed: () => void
  entry: PlacementEntry
  focusTarget: "bin" | "qty" | null
  onSaved?: () => void
  onRemove?: () => void
}

function PlacementRow({
  item,
  putawayId,
  locationId,
  defaultRack,
  editable,
  onProcessed,
  entry,
  focusTarget,
  onSaved,
  onRemove,
}: PlacementRowProps) {
  const processMutation = useProcessPutawayItem()
  const isExisting = entry.initialBinQty > 0

  const [binCode, setBinCode] = useState(entry.initialBinCode)
  const [binResult, setBinResult] = useState<BinLookupResult | null>(null)
  const [binError, setBinError] = useState("")
  const [binLoading, setBinLoading] = useState(false)
  const [qty, setQty] = useState(entry.initialBinQty > 0 ? String(entry.initialBinQty) : "")
  const [hasSaved, setHasSaved] = useState(entry.initialBinQty > 0)

  const binInputRef = useRef<HTMLInputElement>(null)
  const qtyInputRef = useRef<HTMLInputElement>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const lastSavedQty = useRef(entry.initialSavedQty)

  useEffect(() => {
    if (focusTarget === "bin") {
      setTimeout(() => binInputRef.current?.focus(), 50)
    } else if (focusTarget === "qty") {
      setTimeout(() => qtyInputRef.current?.focus(), 50)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isExisting && defaultRack && !binResult && !binCode) {
      setBinCode(defaultRack.bin_final_code)
      setBinResult(defaultRack)
    }
  }, [defaultRack, binResult, binCode, isExisting])

  useEffect(() => () => clearTimeout(autoSaveTimer.current), [])

  const saveNow = useCallback((bin: BinLookupResult, targetQty: number, afterSave?: () => void) => {
    const delta = targetQty - lastSavedQty.current
    if (delta <= 0 || processMutation.isPending) return
    processMutation.mutate(
      {
        putawayId,
        itemId: item.id,
        payload: { destination_bin_id: bin.id, qty: delta },
      },
      {
        onSuccess: () => {
          lastSavedQty.current = targetQty
          setHasSaved(true)
          onProcessed()
          afterSave?.()
        },
      }
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

  return (
    <div className="flex items-start gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          <Input
            ref={binInputRef}
            value={binCode}
            placeholder="Kode rak"
            disabled={!editable}
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
                  if (qtyNum > lastSavedQty.current) saveNow(binResult, qtyNum, onSaved)
                } else lookupBin()
              }
            }}
            className={cn(
              "h-8 w-36 font-mono text-xs",
              binResult && "border-emerald-300 ring-1 ring-emerald-200 dark:border-emerald-700 dark:ring-emerald-800"
            )}
          />
          {binLoading && <Loader2Icon className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        {binError && <p className="text-[10px] text-red-500">{binError}</p>}
        {binResult && binResult.remaining_capacity != null && (
          <p className="text-[10px] text-muted-foreground">
            Sisa kapasitas: {binResult.remaining_capacity}/{binResult.max_qty}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          ref={qtyInputRef}
          type="number"
          min={1}
          max={entry.maxQty}
          value={qty}
          placeholder="0"
          disabled={!editable}
          onChange={(e) => {
            const v = e.target.value
            if (v === "") { setQty(""); return }
            const n = parseInt(v) || 0
            setQty(String(Math.max(0, Math.min(entry.maxQty, n))))
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && binResult) {
              e.preventDefault()
              clearTimeout(autoSaveTimer.current)
              const qtyNum = parseInt(qty) || 0
              if (qtyNum > lastSavedQty.current) saveNow(binResult, qtyNum, onSaved)
            }
          }}
          className="h-8 w-20 tabular-nums text-xs"
        />
        {processMutation.isPending ? (
          <Loader2Icon className="h-3.5 w-3.5 animate-spin text-amber-500" />
        ) : hasSaved ? (
          <CheckCircle2Icon className="h-3.5 w-3.5 text-emerald-500" />
        ) : null}
      </div>

      {onRemove && editable && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-red-500"
          aria-label="Hapus penempatan"
        >
          <Trash2Icon className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
