"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, Loader2Icon, PackageCheckIcon } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { PageTitle } from "@/components/dashboard/page-title"
import { usePurchaseOrderDetail } from "@/hooks/transaksi-pembelian/use-purchase-orders"
import { useReceivePurchaseOrder } from "@/hooks/barang-masuk/use-receive-purchase-order"

interface ItemQty {
  purchase_order_item_id: string
  qty: number
  max: number
}

export default function TerimaPOPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: po, isLoading } = usePurchaseOrderDetail(id)
  const receiveMutation = useReceivePurchaseOrder()

  const [receivedBy, setReceivedBy] = useState("")
  const [itemQtys, setItemQtys] = useState<ItemQty[]>([])
  const [initialized, setInitialized] = useState(false)

  if (po && !initialized) {
    setItemQtys(
      po.items.map((item) => ({
        purchase_order_item_id: item.id,
        qty: item.qty - item.received_qty,
        max: item.qty - item.received_qty,
      }))
    )
    setInitialized(true)
  }

  const hasValidQty = useMemo(
    () => itemQtys.some((i) => i.qty > 0),
    [itemQtys]
  )

  const canSubmit = receivedBy.trim() !== "" && hasValidQty && !receiveMutation.isPending

  function handleQtyChange(index: number, value: string) {
    const num = Math.max(0, parseInt(value) || 0)
    setItemQtys((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, qty: Math.min(num, item.max) } : item
      )
    )
  }

  function handleSubmit() {
    if (!canSubmit) return
    receiveMutation.mutate(
      {
        id,
        data: {
          received_by: receivedBy.trim(),
          items: itemQtys
            .filter((i) => i.qty > 0)
            .map((i) => ({
              purchase_order_item_id: i.purchase_order_item_id,
              qty: i.qty,
            })),
        },
      },
      {
        onSuccess: () => router.push("/dashboard/barang-masuk"),
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
            <div className="px-5 py-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">No. PO</p>
                  <p className="mt-1 text-sm font-semibold">{po.po_number}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pemasok</p>
                  <p className="mt-1 text-sm">{po.contact?.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Lokasi</p>
                  <p className="mt-1 text-sm">{po.location?.location_name ?? "—"}</p>
                </div>
              </div>
            </div>
          </LiquidGlass>

          <LiquidGlass radius={20} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04]">
            <div className="px-5 py-4">
              <div className="mb-4 max-w-xs">
                <Label htmlFor="received_by" className="text-sm font-medium">
                  Diterima oleh <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="received_by"
                  placeholder="Nama penerima"
                  value={receivedBy}
                  onChange={(e) => setReceivedBy(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 bg-muted/30">
                      {["SKU", "Produk", "Qty Pesanan", "Sudah Diterima", "Sisa", "Qty Terima"].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {po.items.map((item, index) => {
                      const remaining = item.qty - item.received_qty
                      const currentQty = itemQtys[index]?.qty ?? 0
                      return (
                        <tr key={item.id} className="border-b border-border/20 last:border-0">
                          <td className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                            {item.product?.sku ?? "—"}
                          </td>
                          <td className="px-3 py-3 text-muted-foreground">
                            {item.product?.name ?? item.description ?? "—"}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                            {item.qty} {item.unit ?? ""}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums text-muted-foreground">
                            {item.received_qty}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 tabular-nums">
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
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            {remaining > 0 ? (
                              <Input
                                type="number"
                                min={0}
                                max={remaining}
                                value={currentQty}
                                onChange={(e) => handleQtyChange(index, e.target.value)}
                                className="h-8 w-20 tabular-nums"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">Lengkap</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </LiquidGlass>

          <div className="flex items-center justify-end gap-3">
            <Link href="/dashboard/barang-masuk">
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
