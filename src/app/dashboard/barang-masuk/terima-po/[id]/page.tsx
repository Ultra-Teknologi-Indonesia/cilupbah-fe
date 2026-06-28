"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, PackageCheckIcon, ImageIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { PageTitle } from "@/components/dashboard/page-title"
import { SimplePagination } from "@/components/ui/simple-pagination"
import { usePurchaseOrderDetail, usePurchaseOrderItems } from "@/hooks/transaksi-pembelian/use-purchase-orders"
import { useReceivePurchaseOrder } from "@/hooks/barang-masuk/use-receive-purchase-order"

interface ItemQty {
  purchase_order_item_id: string
  qty: number
  max: number
  notes: string
}

export default function TerimaPOPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: po, isLoading } = usePurchaseOrderDetail(id)
  
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const { data: itemsRes, isFetching: isFetchingItems } = usePurchaseOrderItems(id, { page, perPage })
  const items = itemsRes?.data ?? []
  const itemsMeta = itemsRes?.meta

  const receiveMutation = useReceivePurchaseOrder()

  const [referenceNumber, setReferenceNumber] = useState("")
  const [receiveDate, setReceiveDate] = useState(() => new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  
  // Use a record keyed by purchase_order_item_id to maintain state across pages
  const [itemQtys, setItemQtys] = useState<Record<string, ItemQty>>({})

  // Compute hasValidQty by checking the values in itemQtys
  const hasValidQty = useMemo(
    () => Object.values(itemQtys).some((i) => i.qty > 0),
    [itemQtys]
  )

  const canSubmit = hasValidQty && !receiveMutation.isPending

  function handleQtyChange(itemId: string, maxQty: number, value: string) {
    const num = Math.max(0, parseInt(value) || 0)
    const qty = Math.min(num, maxQty)
    setItemQtys((prev) => ({
      ...prev,
      [itemId]: {
        purchase_order_item_id: itemId,
        max: maxQty,
        qty: qty,
        notes: prev[itemId]?.notes ?? ""
      }
    }))
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

  function handleSubmit() {
    if (!canSubmit) return
    receiveMutation.mutate(
      {
        id,
        data: {
          reference_number: referenceNumber.trim() || undefined,
          receive_date: receiveDate,
          location_id: po?.location_id,
          notes: notes.trim() || undefined,
          items: Object.values(itemQtys)
            .filter((i) => i.qty > 0)
            .map((i) => ({
              purchase_order_item_id: i.purchase_order_item_id,
              qty: i.qty,
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
                    <Input type="date" value={receiveDate} onChange={(e) => setReceiveDate(e.target.value)} />
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
                      <TableHead className="whitespace-nowrap w-12 text-muted-foreground">
                        {/* Gambar */}
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground">Produk</TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground">Qty Pesanan</TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground">Sudah Diterima</TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground">Sisa</TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground">Qty Terima</TableHead>
                      <TableHead className="whitespace-nowrap text-muted-foreground">Keterangan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => {
                      const remaining = item.qty - item.received_qty
                      const currentQty = itemQtys[item.id]?.qty ?? 0
                      const variantName = item.variant?.options?.length ? item.variant.options.map(o => o.value).join(", ") : item.variant?.name
                      const productName = variantName ? `${item.product?.name} - ${variantName}` : (item.product?.name ?? item.description ?? "—")
                      const imageUrl = item.variant?.media?.[0]?.url ?? item.product?.media?.[0]?.url ?? item.product?.image_url
                      
                      return (
                        <TableRow key={item.id} className="border-b border-border/20 last:border-0">
                          <TableCell className="px-3 py-3">
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                              {imageUrl ? (
                                <img src={imageUrl} alt={productName} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                                  <ImageIcon className="h-4 w-4 opacity-50" />
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-3">
                            <div className="max-w-[250px] sm:max-w-[300px] xl:max-w-[400px]">
                              <div className="font-medium whitespace-normal break-words">{productName}</div>
                              <div className="text-xs text-muted-foreground">{item.product?.sku ?? "—"}</div>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                            {item.qty} {item.unit ?? ""}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                            {item.received_qty}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-3 tabular-nums">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px]",
                                remaining > 0
                                  ? "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400"
                                  : "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400"
                              )}
                            >
                              {remaining}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-3">
                            {remaining > 0 ? (
                              <Input
                                type="number"
                                min={0}
                                max={remaining}
                                value={currentQty}
                                onChange={(e) => handleQtyChange(item.id, remaining, e.target.value)}
                                className="h-8 w-20 tabular-nums"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">Lengkap</span>
                            )}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-3">
                            {remaining > 0 ? (
                              <Input
                                value={itemQtys[item.id]?.notes ?? ""}
                                onChange={(e) => handleNoteChange(item.id, e.target.value)}
                                placeholder="Opsional"
                                className="h-8 w-40"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                    {items.length === 0 && !isFetchingItems && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                          Belum ada produk.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
