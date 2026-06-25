"use client"

import { useState, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, CheckCircleIcon, SearchIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PageTitle } from "@/components/dashboard/page-title"
import { usePutawayDetail, usePutawayItems, useStartPutaway, useProcessPutawayItem, useCompletePutaway } from "@/hooks/barang-masuk/use-putaway-actions"
import { PutawayService } from "@/services/barang-masuk/putaway.service"
import type { PutawayItem } from "@/types/barang-masuk/putaway"
import type { BinLookupResult } from "@/services/barang-masuk/putaway.service"

export default function PutawayProcessPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: putaway, isLoading, refetch: refetchDetail } = usePutawayDetail(id)
  const { data: items, refetch: refetchItems } = usePutawayItems(id)

  const startMutation = useStartPutaway()
  const processMutation = useProcessPutawayItem()
  const completeMutation = useCompletePutaway()

  const [activeItem, setActiveItem] = useState<PutawayItem | null>(null)
  const [binCode, setBinCode] = useState("")
  const [binResult, setBinResult] = useState<BinLookupResult | null>(null)
  const [binError, setBinError] = useState("")
  const [binLoading, setBinLoading] = useState(false)
  const [placeQty, setPlaceQty] = useState(0)
  const [completeOpen, setCompleteOpen] = useState(false)

  const locationId = putaway?.location_id ?? ""

  const handleLookupBin = useCallback(async () => {
    if (!binCode.trim() || !locationId) return
    setBinLoading(true)
    setBinError("")
    setBinResult(null)
    try {
      const result = await PutawayService.lookupBin(binCode.trim(), locationId)
      setBinResult(result)
    } catch (err) {
      setBinError((err as { message?: string })?.message || "Rak tidak ditemukan")
    } finally {
      setBinLoading(false)
    }
  }, [binCode, locationId])

  const handleSelectItem = useCallback((item: PutawayItem) => {
    const remaining = item.qty - item.putaway_qty
    setActiveItem(item)
    setBinCode("")
    setBinResult(null)
    setBinError("")
    setPlaceQty(remaining)
  }, [])

  const handleProcessItem = useCallback(() => {
    if (!activeItem || !binResult || placeQty <= 0) return
    processMutation.mutate(
      {
        putawayId: id,
        itemId: activeItem.id,
        payload: { destination_bin_id: binResult.id, qty: placeQty },
      },
      {
        onSuccess: () => {
          setActiveItem(null)
          setBinCode("")
          setBinResult(null)
          refetchItems()
          refetchDetail()
        },
      }
    )
  }, [activeItem, binResult, placeQty, id, processMutation, refetchItems, refetchDetail])

  const handleStart = useCallback(() => {
    startMutation.mutate(id, {
      onSuccess: () => refetchDetail(),
    })
  }, [id, startMutation, refetchDetail])

  const handleComplete = useCallback(() => {
    completeMutation.mutate(id, {
      onSuccess: () => {
        setCompleteOpen(false)
        router.push("/dashboard/barang-masuk")
      },
    })
  }, [id, completeMutation, router])

  const isNotStarted = putaway?.status === "NOT_STARTED"
  const isInProgress = putaway?.status === "IN_PROGRESS"
  const isCompleted = putaway?.status === "COMPLETED"

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Penempatan Barang"
        description={putaway ? `Proses penempatan ${putaway.putaway_no}` : "Memuat..."}
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Penempatan" },
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
            <Link href="/dashboard/barang-masuk">
              <Button variant="outline" size="sm">
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Kembali
              </Button>
            </Link>
          </div>
        </LiquidGlass>
      ) : (
        <div className="flex flex-col gap-4">
          <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">No. Putaway</p>
                  <p className="mt-1 text-sm font-semibold">{putaway.putaway_no}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Lokasi</p>
                  <p className="mt-1 text-sm">{putaway.location?.location_name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Petugas</p>
                  <p className="mt-1 text-sm">{putaway.assignee?.name ?? "Belum di-assign"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</p>
                  <Badge
                    variant="outline"
                    className={cn("mt-1 text-[10px]", {
                      "border-slate-300 text-slate-600": isNotStarted,
                      "border-amber-300 text-amber-600": isInProgress,
                      "border-emerald-300 text-emerald-600": isCompleted,
                    })}
                  >
                    {isNotStarted ? "Belum Mulai" : isInProgress ? "Sedang Diproses" : isCompleted ? "Selesai" : putaway.status}
                  </Badge>
                </div>
              </div>
            </div>
          </LiquidGlass>

          {isNotStarted && (
            <div className="flex justify-center">
              <Button variant="primary" onClick={handleStart} disabled={startMutation.isPending}>
                {startMutation.isPending && <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />}
                Mulai Penempatan
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
              <div className="px-5 py-4">
                <h3 className="mb-3 text-sm font-semibold">Daftar Item</h3>
                <div className="overflow-x-auto rounded-lg border border-border/40">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 bg-muted/30">
                        {["SKU", "Qty", "Ditempatkan", "Sisa", ""].map((h) => (
                          <th key={h} className="whitespace-nowrap px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(items ?? []).map((item: PutawayItem) => {
                        const remaining = item.qty - item.putaway_qty
                        const isActive = activeItem?.id === item.id
                        return (
                          <tr
                            key={item.id}
                            className={cn(
                              "border-b border-border/20 transition-colors last:border-0",
                              isActive ? "bg-primary/5" : "hover:bg-muted/40",
                              remaining <= 0 && "opacity-50"
                            )}
                          >
                            <td className="whitespace-nowrap px-3 py-2.5 font-mono text-xs">
                              {item.variant?.sku ?? "—"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                              {item.qty}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-muted-foreground">
                              {item.putaway_qty}
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px]",
                                  remaining > 0
                                    ? "border-amber-300 text-amber-600"
                                    : "border-emerald-300 text-emerald-600"
                                )}
                              >
                                {remaining}
                              </Badge>
                            </td>
                            <td className="whitespace-nowrap px-3 py-2.5">
                              {remaining > 0 && isInProgress && (
                                <button
                                  type="button"
                                  onClick={() => handleSelectItem(item)}
                                  className="text-xs font-medium text-primary hover:underline"
                                >
                                  Pilih
                                </button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                      {(!items || items.length === 0) && (
                        <tr>
                          <td colSpan={5} className="px-3 py-8 text-center text-xs text-muted-foreground">
                            Tidak ada item
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </LiquidGlass>

            <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
              <div className="px-5 py-4">
                <h3 className="mb-3 text-sm font-semibold">Tempatkan ke Rak</h3>
                {!activeItem ? (
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <p className="text-xs">Pilih item dari daftar di sebelah kiri</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="rounded-lg border border-border/40 bg-muted/20 px-3 py-2.5">
                      <p className="text-xs text-muted-foreground">Item terpilih</p>
                      <p className="text-sm font-medium">{activeItem.variant?.sku ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        Sisa: {activeItem.qty - activeItem.putaway_qty} unit
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="bin-code" className="text-sm font-medium">
                        Kode Rak <span className="text-red-500">*</span>
                      </Label>
                      <div className="mt-1.5 flex gap-2">
                        <Input
                          id="bin-code"
                          placeholder="Scan / ketik kode rak"
                          value={binCode}
                          onChange={(e) => { setBinCode(e.target.value); setBinResult(null); setBinError("") }}
                          onKeyDown={(e) => { if (e.key === "Enter") handleLookupBin() }}
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleLookupBin}
                          disabled={binLoading || !binCode.trim()}
                        >
                          {binLoading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
                        </Button>
                      </div>
                      {binError && <p className="mt-1 text-xs text-red-500">{binError}</p>}
                      {binResult && (
                        <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs dark:border-emerald-800 dark:bg-emerald-900/20">
                          <span className="font-medium text-emerald-700 dark:text-emerald-400">
                            {binResult.bin_final_code}
                          </span>
                          {binResult.bin_label && (
                            <span className="ml-1 text-emerald-600 dark:text-emerald-500">
                              — {binResult.bin_label}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="place-qty" className="text-sm font-medium">
                        Qty <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="place-qty"
                        type="number"
                        min={1}
                        max={activeItem.qty - activeItem.putaway_qty}
                        value={placeQty}
                        onChange={(e) => setPlaceQty(Math.max(0, parseInt(e.target.value) || 0))}
                        className="mt-1.5 w-28 tabular-nums"
                      />
                    </div>

                    <Button
                      variant="primary"
                      disabled={!binResult || placeQty <= 0 || processMutation.isPending}
                      onClick={handleProcessItem}
                    >
                      {processMutation.isPending && <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />}
                      Tempatkan
                    </Button>
                  </div>
                )}
              </div>
            </LiquidGlass>
          </div>

          <div className="flex items-center justify-between">
            <Link href="/dashboard/barang-masuk">
              <Button variant="outline">
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Kembali
              </Button>
            </Link>
            {isInProgress && (
              <Button
                variant="primary"
                onClick={() => setCompleteOpen(true)}
              >
                <CheckCircleIcon className="mr-1.5 h-4 w-4" />
                Selesaikan Putaway
              </Button>
            )}
          </div>

          <ConfirmDialog
            open={completeOpen}
            onOpenChange={setCompleteOpen}
            title="Selesaikan Putaway"
            description={`Tandai ${putaway.putaway_no} sebagai selesai? Stok akan dipindahkan ke rak tujuan.`}
            confirmLabel="Selesaikan"
            loading={completeMutation.isPending}
            onConfirm={handleComplete}
          />
        </div>
      )}
    </div>
  )
}
