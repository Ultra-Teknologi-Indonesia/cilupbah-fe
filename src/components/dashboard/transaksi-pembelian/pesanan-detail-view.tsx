"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {

  PackageIcon,
  Trash2Icon,
  ImageIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

import { PageTitle } from "@/components/dashboard/page-title"
import {

  usePurchaseOrderDetail,
  usePurchaseOrderItems,
  useDeletePurchaseOrder,
} from "@/hooks/transaksi-pembelian/use-purchase-orders"
import { SimplePagination } from "@/components/ui/simple-pagination"
import type { PurchaseOrderStatus } from "@/types/transaksi-pembelian/purchase-order"

const STATUS_STYLE: Record<PurchaseOrderStatus, string> = {
  DRAFT: "border-slate-300 text-slate-600 dark:border-slate-500/30 dark:text-slate-400",
  OPEN: "border-blue-300 text-blue-600 dark:border-blue-500/30 dark:text-blue-400",
  PARTIAL_RECEIVED: "border-amber-300 text-amber-600 dark:border-amber-500/30 dark:text-amber-400",
  FULLY_RECEIVED: "border-emerald-300 text-emerald-600 dark:border-emerald-500/30 dark:text-emerald-400",
  CANCELLED: "border-red-300 text-red-600 dark:border-red-500/30 dark:text-red-400",
}

const STATUS_LABEL: Record<PurchaseOrderStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  PARTIAL_RECEIVED: "Diterima Sebagian",
  FULLY_RECEIVED: "Diterima Penuh",
  CANCELLED: "Dibatalkan",
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-36 shrink-0 text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "—"}</span>
    </div>
  )
}

export function PesananDetailView({ id }: { id: string }) {
  const router = useRouter()
  const { data: po, isLoading } = usePurchaseOrderDetail(id)
  
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const { data: itemsRes, isFetching: isFetchingItems } = usePurchaseOrderItems(id, { page, perPage })
  const items = itemsRes?.data ?? []
  const itemsMeta = itemsRes?.meta
  const deleteMut = useDeletePurchaseOrder()

  const [confirmAction, setConfirmAction] = useState<"delete" | null>(null)

  function handleDelete() {
    if (!po) return
    deleteMut.mutate(po.id, {
      onSuccess: () => {
        setConfirmAction(null)
        router.push("/dashboard/transaksi-pembelian")
      }
    })
  }


  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!po) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
        <PackageIcon className="h-10 w-10" />
        <p className="text-sm">Pesanan tidak ditemukan.</p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/transaksi-pembelian">Kembali</Link>
        </Button>
      </div>
    )
  }

  const isDraft = po.status === "DRAFT"

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title={po.po_number}
        backHref="/dashboard/transaksi-pembelian"
        breadcrumb={[
          { label: "Pembelian" },
          { label: "Transaksi Pembelian", href: "/dashboard/transaksi-pembelian" },
          { label: "Pesanan", href: "/dashboard/transaksi-pembelian" },
          { label: po.po_number },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {(po.status === "OPEN" || po.status === "DRAFT") && (
              <Button variant="outline" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmAction("delete")}>
                <Trash2Icon className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            )}
            <Badge variant="outline" className={cn("text-xs", STATUS_STYLE[po.status])}>
              {STATUS_LABEL[po.status]}
            </Badge>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <h3 className="mb-4 font-semibold">Informasi Pesanan</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <DetailRow label="Pemasok" value={po.contact?.name} />
              <DetailRow label="Lokasi" value={po.location?.location_name} />
              <DetailRow label="Tanggal Pesanan" value={formatDate(po.order_date)} />
              <DetailRow label="No. Referensi" value={po.ref_no} />
              <DetailRow label="Termin Pembayaran" value={po.payment_term ? `${po.payment_term} hari` : null} />
              <DetailRow label="Keterangan" value={po.notes} />
            </div>
          </LiquidGlass>

          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <h3 className="mb-4 font-semibold">Daftar Produk</h3>
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <Table className="w-full text-sm">
                <TableHeader>
                  <TableRow className="border-b border-border/60 bg-muted/30">
                    <TableHead className="whitespace-nowrap w-12 text-muted-foreground"></TableHead>
                    <TableHead className="whitespace-nowrap text-muted-foreground">Produk</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">Harga</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">Qty</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">Diterima</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">Diskon</TableHead>
                    <TableHead className="whitespace-nowrap text-right text-muted-foreground">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const variantName = item.variant?.options?.length ? item.variant.options.map(o => o.value).join(", ") : item.variant?.name
                    const productDisplayName = item.product?.name ?? item.description ?? "—"
                    const imageUrl = item.variant?.media?.[0]?.url ?? item.product?.media?.[0]?.url ?? item.product?.image_url
                    return (
                    <TableRow key={item.id} className="border-b border-border/20 last:border-0">
                      <TableCell className="px-3 py-2.5">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted/50">
                          {imageUrl ? (
                            <img src={imageUrl} alt={productDisplayName} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                              <ImageIcon className="h-4 w-4 opacity-50" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5">
                        <div className="flex min-w-0 flex-col gap-0.5" style={{ maxWidth: 280 }}>
                          <span className="font-medium whitespace-normal break-words text-foreground">{productDisplayName}</span>
                          {variantName && (
                            <span className="whitespace-normal break-words text-xs text-foreground">{variantName}</span>
                          )}
                          {item.product?.sku && (
                            <span className="font-mono text-[11px] text-foreground/80">{item.product.sku}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        <div className="flex flex-col items-end gap-0.5">
                          <span>{formatCurrency(item.unit_price)}</span>
                          {(Number(item.shipping_cost ?? 0) > 0 ||
                            Number(item.disc_amount ?? 0) > 0) && (
                            <span className="text-[11px] text-foreground">
                              {Number(item.shipping_cost ?? 0) > 0 &&
                                `Ongkos: ${formatCurrency(Number(item.shipping_cost))}`}
                              {Number(item.shipping_cost ?? 0) > 0 &&
                                Number(item.disc_amount ?? 0) > 0 &&
                                " · "}
                              {Number(item.disc_amount ?? 0) > 0 &&
                                `Diskon: ${formatCurrency(Number(item.disc_amount))}`}
                            </span>
                          )}
                          {item.landed_cost_per_unit !== undefined &&
                            Number(item.landed_cost_per_unit) !==
                              Number(item.unit_price) && (
                              <span className="text-[11px] text-foreground">
                                Landed: {formatCurrency(Number(item.landed_cost_per_unit))}/unit
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">{item.qty}</TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums">
                        <span className={cn(item.received_qty >= item.qty ? "text-emerald-600" : item.received_qty > 0 ? "text-amber-600" : "text-foreground")}>
                          {item.received_qty}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right tabular-nums text-foreground">
                        {item.disc > 0 ? `${item.disc}%` : "—"}
                      </TableCell>
                      <TableCell className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">{formatCurrency(item.amount)}</TableCell>
                    </TableRow>
                    )
                  })}
                  {items.length === 0 && (
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
          </LiquidGlass>
        </div>

        <div className="flex flex-col gap-4">
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5 sticky top-4">
            <h3 className="mb-4 font-semibold">Rincian</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Jumlah Produk</span>
                <span className="font-medium">{itemsMeta?.total ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="tabular-nums">{formatCurrency(po.sub_total)}</span>
              </div>
              {po.total_disc > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Diskon</span>
                  <span className="tabular-nums">-{formatCurrency(po.total_disc)}</span>
                </div>
              )}
              {po.total_tax > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pajak</span>
                  <span className="tabular-nums">{formatCurrency(po.total_tax)}</span>
                </div>
              )}
              <div className="border-t border-border/40 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(po.total_amount)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 border-t border-border/40 pt-4 text-xs text-muted-foreground">
              <p>Dibuat oleh: {po.created_by}</p>
              <p>Pada: {formatDate(po.created_at)}</p>
            </div>
          </LiquidGlass>
        </div>
      </div>

      <ConfirmDialog
        open={confirmAction === "delete"}
        onOpenChange={(v) => !v && setConfirmAction(null)}
        title="Hapus Pesanan"
        description={`Apakah Anda yakin ingin menghapus pesanan "${po.po_number}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus"
        variant="destructive"
        loading={deleteMut.isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
