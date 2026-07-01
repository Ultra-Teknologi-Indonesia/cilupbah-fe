"use client"

import { useState, useMemo, useEffect, Fragment } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, PackageCheckIcon, ImageIcon, CheckCircle2Icon, XCircleIcon } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { PageTitle } from "@/components/dashboard/page-title"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { usePurchaseOrderDetail, usePurchaseOrderItems } from "@/hooks/transaksi-pembelian/use-purchase-orders"
import { useReceivePurchaseOrder } from "@/hooks/barang-masuk/use-receive-purchase-order"

interface ItemQty {
  purchase_order_item_id: string
  qty: number
  rejected_qty: number
  max: number
  notes: string
  rejection_note: string
}

export function TerimaPOView({ id }: { id: string }) {
  const router = useRouter()
  const { data: po, isLoading } = usePurchaseOrderDetail(id)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(20)
  const { data: itemsRes, isFetching: isFetchingItems } = usePurchaseOrderItems(id, { page, perPage })
  const items = itemsRes?.data ?? []
  const itemsMeta = itemsRes?.meta

  const receiveMutation = useReceivePurchaseOrder()

  const [referenceNumber, setReferenceNumber] = useState("")
  const [receiveDate, setReceiveDate] = useState<Date>(() => new Date())
  const [notes, setNotes] = useState("")

  const [itemQtys, setItemQtys] = useState<Record<string, ItemQty>>({})

  useEffect(() => {
    if (items.length > 0) {
      setItemQtys((prev) => {
        const next = { ...prev }
        let hasChanges = false
        items.forEach((item) => {
          if (!next[item.id]) {
            const remaining = item.qty - item.received_qty
            if (remaining > 0) {
              next[item.id] = {
                purchase_order_item_id: item.id,
                qty: remaining,
                rejected_qty: 0,
                max: remaining,
                notes: "",
                rejection_note: "",
              }
              hasChanges = true
            }
          }
        })
        return hasChanges ? next : prev
      })
    }
  }, [items])

  const hasValidQty = useMemo(
    () => Object.values(itemQtys).some((i) => i.qty > 0 || i.rejected_qty > 0),
    [itemQtys]
  )

  const canSubmit = hasValidQty && !receiveMutation.isPending

  const totalAccepted = useMemo(
    () => Object.values(itemQtys).reduce((s, i) => s + i.qty, 0),
    [itemQtys]
  )
  const totalRejected = useMemo(
    () => Object.values(itemQtys).reduce((s, i) => s + i.rejected_qty, 0),
    [itemQtys]
  )

  function handleQtyChange(itemId: string, maxQty: number, value: string) {
    const num = Math.max(0, Math.min(parseInt(value) || 0, maxQty))
    setItemQtys((prev) => {
      const current = prev[itemId]
      return {
        ...prev,
        [itemId]: {
          ...current,
          purchase_order_item_id: itemId,
          max: maxQty,
          qty: num,
          rejected_qty: maxQty - num,
        }
      }
    })
  }

  function handleRejectedQtyChange(itemId: string, maxQty: number, value: string) {
    const num = Math.max(0, Math.min(parseInt(value) || 0, maxQty))
    setItemQtys((prev) => {
      const current = prev[itemId]
      return {
        ...prev,
        [itemId]: {
          ...current,
          purchase_order_item_id: itemId,
          max: maxQty,
          rejected_qty: num,
          qty: maxQty - num,
        }
      }
    })
  }

  function handleNoteChange(itemId: string, value: string) {
    setItemQtys((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        notes: value
      }
    }))
  }

  function handleRejectionNoteChange(itemId: string, value: string) {
    setItemQtys((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        rejection_note: value
      }
    }))
  }

  function handleSubmit() {
    if (!canSubmit) return
    receiveMutation.mutate(
      {
        id,
        data: {
          reference_number: referenceNumber.trim() || undefined,
          receive_date: format(receiveDate, "yyyy-MM-dd"),
          location_id: po?.location_id,
          notes: notes.trim() || undefined,
          items: Object.values(itemQtys)
            .filter((i) => i.qty > 0 || i.rejected_qty > 0)
            .map((i) => ({
              purchase_order_item_id: i.purchase_order_item_id,
              qty: i.qty,
              rejected_qty: i.rejected_qty > 0 ? i.rejected_qty : undefined,
              rejection_note: i.rejected_qty > 0 && i.rejection_note.trim() ? i.rejection_note.trim() : undefined,
              notes: i.notes.trim() || undefined,
            })),
        },
      },
      {
        onSuccess: () => router.push("/dashboard/barang-masuk/penerimaan"),
      }
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Terima Barang — PO"
        description={po ? `Penerimaan untuk ${po.po_number}` : "Memuat..."}
        backHref="/dashboard/barang-masuk"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Barang Masuk", href: "/dashboard/barang-masuk" },
          { label: "Terima PO" },
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
      ) : !po ? (
        <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 p-6 dark:bg-white/[0.04]">
          <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
            <p className="text-sm font-medium">PO tidak ditemukan</p>
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
            <div className="px-5 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">Pemasok</Label>
                    <Input value={po.contact?.name ?? "—"} disabled />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">No. Ref</Label>
                    <Input value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder="Masukkan no. ref" />
                  </div>
                  <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">Tanggal <span className="text-red-500">*</span></Label>
                    <DatePicker
                      value={receiveDate}
                      onChange={(date) => date && setReceiveDate(date)}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">Pesanan Pembelian</Label>
                    <Input value={po.po_number} disabled />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-center gap-4">
                    <Label className="text-sm font-medium text-muted-foreground">Lokasi</Label>
                    <Input value={po.location?.location_name ?? "—"} disabled />
                  </div>
                  <div className="grid grid-cols-[140px_1fr] items-start gap-4">
                    <Label className="text-sm font-medium text-muted-foreground mt-2">Keterangan</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Masukkan keterangan disini"
                    />
                  </div>
                </div>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
            <div className="px-5 py-4">
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <Table className="w-full text-sm">
                  <TableHeader>
                    <TableRow className="border-b border-border/60 bg-muted/30">
                      <TableHead className="text-muted-foreground">Produk</TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground w-16 text-center">Sisa</TableHead>
                      <TableHead className="whitespace-nowrap w-28">
                        <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2Icon className="h-3.5 w-3.5" />
                          Diterima
                        </span>
                      </TableHead>
                      <TableHead className="whitespace-nowrap w-28">
                        <span className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
                          <XCircleIcon className="h-3.5 w-3.5" />
                          Ditolak
                        </span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const remaining = item.qty - item.received_qty
                      const currentQty = itemQtys[item.id]?.qty ?? 0
                      const currentRejected = itemQtys[item.id]?.rejected_qty ?? 0
                      const variantName = item.variant?.options?.length ? item.variant.options.map(o => o.value).join(", ") : item.variant?.name
                      const productName = variantName ? `${item.product?.name} - ${variantName}` : (item.product?.name ?? item.description ?? "—")
                      const imageUrl = item.variant?.media?.[0]?.url ?? item.product?.media?.[0]?.url ?? item.product?.image_url

                      return (
                        <Fragment key={item.id}>
                          <TableRow className={cn(
                            "border-b border-border/20",
                            currentRejected > 0 && "border-b-0"
                          )}>
                            <TableCell className="px-3 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                                  {imageUrl ? (
                                    <img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                      <ImageIcon className="h-4 w-4 opacity-50" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium whitespace-normal break-words leading-snug">{productName}</div>
                                  <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <span>{item.product?.sku ?? "—"}</span>
                                    <span className="text-border">·</span>
                                    <span>Pesanan: {item.qty}</span>
                                    <span className="text-border">·</span>
                                    <span>Sudah diterima: {item.received_qty}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-3 py-3 text-center">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] tabular-nums",
                                  remaining > 0
                                    ? "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400"
                                    : "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400"
                                )}
                              >
                                {remaining}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-3 py-3">
                              {remaining > 0 ? (
                                <Input
                                  type="number"
                                  min={0}
                                  max={remaining}
                                  value={currentQty}
                                  onChange={(e) => handleQtyChange(item.id, remaining, e.target.value)}
                                  className="h-9 w-20 tabular-nums border-emerald-200 bg-emerald-50/50 focus-visible:ring-emerald-500/30 dark:border-emerald-900 dark:bg-emerald-950/30"
                                />
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2Icon className="h-3.5 w-3.5" />
                                  Lengkap
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="px-3 py-3">
                              {remaining > 0 ? (
                                <Input
                                  type="number"
                                  min={0}
                                  max={remaining}
                                  value={currentRejected}
                                  onChange={(e) => handleRejectedQtyChange(item.id, remaining, e.target.value)}
                                  className={cn(
                                    "h-9 w-20 tabular-nums",
                                    currentRejected > 0
                                      ? "border-red-300 bg-red-50/50 text-red-700 focus-visible:ring-red-500/30 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
                                      : "border-border"
                                  )}
                                />
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>

                          {currentRejected > 0 && (
                            <TableRow className="border-b border-border/20">
                              <TableCell colSpan={4} className="px-3 pt-0 pb-3">
                                <div className="ml-[52px] flex items-center gap-3 rounded-md bg-red-50/60 px-3 py-2 dark:bg-red-950/20">
                                  <Label className="shrink-0 text-xs font-medium text-red-600 dark:text-red-400">
                                    Alasan ditolak
                                  </Label>
                                  <Input
                                    value={itemQtys[item.id]?.rejection_note ?? ""}
                                    onChange={(e) => handleRejectionNoteChange(item.id, e.target.value)}
                                    placeholder="Opsional — misal: kemasan rusak, barang cacat, jumlah kurang"
                                    className="h-7 flex-1 border-red-200 bg-white/80 text-xs placeholder:text-red-300 dark:border-red-900 dark:bg-red-950/40 dark:placeholder:text-red-800"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      )
                    })}
                    {items.length === 0 && !isFetchingItems && (
                      <TableRow>
                        <TableCell colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                          Belum ada produk.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {Object.keys(itemQtys).length > 0 && (
                  <div className="flex items-center justify-between border-t border-border/30 bg-muted/20 px-4 py-2.5">
                    <span className="text-xs font-medium text-muted-foreground">Ringkasan QC</span>
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-xs tabular-nums">
                          <span className="font-semibold text-emerald-700 dark:text-emerald-400">{totalAccepted}</span>
                          <span className="ml-1 text-muted-foreground">diterima</span>
                        </span>
                      </div>
                      {totalRejected > 0 && (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-red-500" />
                          <span className="text-xs tabular-nums">
                            <span className="font-semibold text-red-700 dark:text-red-400">{totalRejected}</span>
                            <span className="ml-1 text-muted-foreground">ditolak</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {itemsMeta && (
                  <div className="px-4 py-3 border-t border-border/20">
                    <SimplePagination
                      page={itemsMeta.current_page}
                      lastPage={itemsMeta.last_page}
                      onPageChange={setPage}
                      perPage={perPage}
                      onPerPageChange={setPerPage}
                      isFetching={isFetchingItems}
                      total={itemsMeta.total}
                      label="produk"
                    />
                  </div>
                )}
              </div>
            </div>
          </LiquidGlass>

          <div className="flex items-center justify-end gap-3">
            <Link href="/dashboard/barang-masuk/pesanan">
              <Button variant="outline">
                <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
                Batal
              </Button>
            </Link>
            <Button
              variant="primary"
              disabled={!canSubmit}
              onClick={handleSubmit}
            >
              {receiveMutation.isPending && <Loader2Icon className="mr-1.5 h-4 w-4 animate-spin" />}
              <PackageCheckIcon className="mr-1.5 h-4 w-4" />
              Simpan Penerimaan
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
