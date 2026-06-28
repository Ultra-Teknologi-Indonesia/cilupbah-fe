"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import {
  ArrowLeftIcon,
  Loader2Icon,
  CheckCircleIcon,
  SearchIcon,
  ScanLineIcon,
  QrCodeIcon,
  PackageIcon,
  Trash2Icon,
  PlusIcon,
} from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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

export default function PutawayProcessPage() {
  const params = useParams()
  const id = params.id as string

  const { data: putaway, isLoading, refetch: refetchDetail } = usePutawayDetail(id)
  const { data: items, refetch: refetchItems } = usePutawayItems(id)

  const startMutation = useStartPutaway()

  const [activeRack, setActiveRack] = useState<BinLookupResult | null>(null)
  const [rackInput, setRackInput] = useState("")
  const [rackLoading, setRackLoading] = useState(false)
  const [rackError, setRackError] = useState("")
  const [rackOpen, setRackOpen] = useState(false)

  const [notes, setNotes] = useState("")
  const [scanCode, setScanCode] = useState("")
  const [scanError, setScanError] = useState("")
  const [focusItemId, setFocusItemId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [scannedItemIds, setScannedItemIds] = useState<Set<string>>(new Set())

  const locationId = putaway?.location_id ?? ""

  useEffect(() => {
    if (putaway?.notes != null) setNotes(putaway.notes)
  }, [putaway?.notes])

  const isNotStarted = putaway?.status === "NOT_STARTED"
  const isInProgress = putaway?.status === "IN_PROGRESS"
  const isCompleted = putaway?.status === "COMPLETED"

  const list = useMemo<PutawayItem[]>(() => items ?? [], [items])

  const { totalQty, placedQty } = useMemo(() => {
    return list.reduce(
      (acc, it) => {
        acc.totalQty += it.qty
        acc.placedQty += it.putaway_qty
        return acc
      },
      { totalQty: 0, placedQty: 0 }
    )
  }, [list])
  const progressPct = totalQty > 0 ? Math.round((placedQty / totalQty) * 100) : 0

  const handleLookupRack = useCallback(async () => {
    if (!rackInput.trim() || !locationId) return
    setRackLoading(true)
    setRackError("")
    try {
      const result = await PutawayService.lookupBin(rackInput.trim(), locationId)
      setActiveRack(result)
      setRackInput("")
      setRackOpen(false)
    } catch (err) {
      setRackError((err as { message?: string })?.message || "Rak tidak ditemukan")
    } finally {
      setRackLoading(false)
    }
  }, [rackInput, locationId])

  const handleScan = useCallback(() => {
    const code = scanCode.trim().toLowerCase()
    if (!code) return
    const match = list.find((it) => {
      const remaining = it.qty - it.putaway_qty
      if (remaining <= 0) return false
      return [it.variant?.sku, it.serial_no, it.batch_no]
        .filter(Boolean)
        .some((v) => v!.toLowerCase() === code)
    })
    if (!match) {
      setScanError("Produk tidak ditemukan atau sudah selesai ditempatkan")
      return
    }
    setScanError("")
    setScannedItemIds((prev) => new Set(prev).add(match.id))
    setFocusItemId(match.id)
    setScanCode("")
  }, [scanCode, list])

  const handleStart = useCallback(() => {
    startMutation.mutate(id, { onSuccess: () => refetchDetail() })
  }, [id, startMutation, refetchDetail])

  const onProcessed = useCallback(() => {
    refetchItems()
    refetchDetail()
  }, [refetchItems, refetchDetail])

  const visibleList = useMemo(() => {
    return list.filter((item) => item.putaway_qty > 0 || scannedItemIds.has(item.id))
  }, [list, scannedItemIds])

  const allSelectable = useMemo(
    () => visibleList.filter((it) => it.qty - it.putaway_qty > 0).map((it) => it.id),
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
            </div>

            {/* Ganti Rak card */}
            <Button
              type="button"
              variant="ghost"
              onClick={() => isInProgress && setRackOpen((o) => !o)}
              disabled={!isInProgress}
              className="flex h-auto flex-col items-center gap-2 whitespace-normal rounded-2xl border border-primary/20 bg-primary/5 px-4 py-5 text-center hover:bg-primary/10"
            >
              <span className="text-sm font-semibold text-foreground">Ganti Rak</span>
              <QrCodeIcon className="h-12! w-full! text-foreground/80" strokeWidth={1.2} />
              <span className="text-[11px] font-normal text-muted-foreground">
                Scan QR rak tersedia segera
              </span>
            </Button>

            {rackOpen && isInProgress && (
              <div className="-mt-2 flex flex-col gap-1.5">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ketik kode rak tujuan"
                    value={rackInput}
                    onChange={(e) => {
                      setRackInput(e.target.value)
                      setRackError("")
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleLookupRack()
                    }}
                    autoFocus
                    className="h-9 flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLookupRack}
                    disabled={rackLoading || !rackInput.trim()}
                  >
                    {rackLoading ? (
                      <Loader2Icon className="h-4 w-4 animate-spin" />
                    ) : (
                      <SearchIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {rackError && <p className="text-xs text-red-500">{rackError}</p>}
                <p className="text-[11px] text-muted-foreground">
                  Rak ini akan terisi otomatis pada baris baru.
                </p>
              </div>
            )}

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
                      Kode Rak
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
                        {isNotStarted ? (
                          <div className="flex flex-col items-center gap-3">
                            <Button
                              variant="primary"
                              onClick={handleStart}
                              disabled={startMutation.isPending}
                              className="rounded-xl"
                            >
                              {startMutation.isPending ? (
                                <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />
                              ) : (
                                <PlusIcon className="mr-1.5 h-4 w-4" />
                              )}
                              Mulai Penempatan
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              Mulai penempatan untuk memproses barang.
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Silakan scan produk untuk memulai penempatan.</p>
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
                        highlighted={focusItemId === item.id}
                        onProcessed={onProcessed}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </LiquidGlass>

            <div className="flex items-center justify-end">
              <div className="flex items-center gap-2">
                {isNotStarted && list.length > 0 && (
                  <Button variant="primary" onClick={handleStart} disabled={startMutation.isPending}>
                    {startMutation.isPending && <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />}
                    Mulai Penempatan
                  </Button>
                )}
              </div>
            </div>
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
}: PutawayItemRowProps) {
  const processMutation = useProcessPutawayItem()
  const remaining = item.qty - item.putaway_qty
  const done = remaining <= 0

  const [binCode, setBinCode] = useState("")
  const [binResult, setBinResult] = useState<BinLookupResult | null>(null)
  const [binError, setBinError] = useState("")
  const [binLoading, setBinLoading] = useState(false)
  const [qty, setQty] = useState(remaining > 0 ? remaining : item.putaway_qty)

  const rowRef = useRef<HTMLTableRowElement>(null)
  const binInputRef = useRef<HTMLInputElement>(null)

  // Prefill the default (active) rack on empty, still-pending rows.
  useEffect(() => {
    if (defaultRack && !binResult && !binCode && !done) {
      setBinCode(defaultRack.bin_final_code)
      setBinResult(defaultRack)
    }
  }, [defaultRack, binResult, binCode, done])

  // When this row is targeted by a scan, scroll into view and focus the rack input.
  useEffect(() => {
    if (highlighted) {
      rowRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      binInputRef.current?.focus()
    }
  }, [highlighted])

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

  const place = useCallback(async () => {
    let bin = binResult
    if (!bin) {
      await lookupBin()
      return
    }
    if (qty <= 0) return
    processMutation.mutate(
      {
        putawayId,
        itemId: item.id,
        payload: { destination_bin_id: bin.id, qty: Math.min(qty, remaining) },
      },
      {
        onSuccess: () => {
          setBinCode("")
          setBinResult(null)
          onProcessed()
        },
      }
    )
  }, [binResult, lookupBin, qty, processMutation, putawayId, item.id, remaining, onProcessed])

  const variationLabel = item.variant?.variation_values?.map((v) => v.value).join(" / ")

  return (
    <TableRow
      ref={rowRef}
      data-state={selected ? "selected" : undefined}
      className={cn(
        highlighted && "bg-primary/5 ring-1 ring-inset ring-primary/30",
        done && "opacity-60"
      )}
    >
      <TableCell className="pl-5">
        <Checkbox
          checked={selected}
          onCheckedChange={onToggleSelect}
          disabled={!editable || done}
          aria-label="Pilih item"
        />
      </TableCell>

      <TableCell className="max-w-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-muted/40 text-muted-foreground">
            <PackageIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground" title={item.variant?.item_name}>
              {item.variant?.item_name ?? "—"}
            </p>
            <p className="truncate font-mono text-xs text-muted-foreground">
              {item.variant?.sku ?? "—"}
            </p>
            {variationLabel && (
              <p className="truncate text-[11px] text-muted-foreground">{variationLabel}</p>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        {done ? (
          <span className="font-mono text-xs text-muted-foreground">Selesai</span>
        ) : editable ? (
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
                    if (binResult) place()
                    else lookupBin()
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
          </div>
        ) : (
          <span className="font-mono text-xs text-muted-foreground">—</span>
        )}
      </TableCell>

      <TableCell>
        {done ? (
          <span className="tabular-nums text-sm">{item.putaway_qty}</span>
        ) : editable ? (
          <Input
            type="number"
            min={1}
            max={remaining}
            value={qty}
            onChange={(e) => setQty(Math.max(0, Math.min(remaining, parseInt(e.target.value) || 0)))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && binResult) {
                e.preventDefault()
                place()
              }
            }}
            className="h-9 w-20 tabular-nums"
          />
        ) : (
          <span className="tabular-nums text-sm">{item.qty}</span>
        )}
      </TableCell>

      <TableCell className="pr-5">
        {!done && editable && (
          binResult && qty > 0 ? (
            <Button
              variant="primary"
              size="sm"
              className="h-8 rounded-lg px-2.5"
              onClick={place}
              disabled={processMutation.isPending}
              aria-label="Tempatkan"
              title="Tempatkan"
            >
              {processMutation.isPending ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircleIcon className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => {
                setBinCode("")
                setBinResult(null)
                setBinError("")
              }}
              className="text-muted-foreground hover:text-red-500"
              aria-label="Bersihkan"
              title="Bersihkan baris"
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          )
        )}
      </TableCell>
    </TableRow>
  )
}
