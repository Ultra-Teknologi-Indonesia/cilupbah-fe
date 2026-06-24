"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  XIcon,
  PlusIcon,
  Trash2Icon,
  ImageIcon,
  PackageIcon,
  SaveIcon,
  Loader2Icon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"
import { LiquidGlass } from "@/components/ui/liquid-glass"
import { Skeleton } from "@/components/ui/skeleton"
import { DatePicker } from "@/components/ui/date-picker"
import { PageTitle } from "@/components/dashboard/page-title"
import { useContacts } from "@/hooks/kontak-pemasok/use-contacts"
import { useLocations } from "@/hooks/manajemen-rak/use-locations"
import { usePurchaseOrders } from "@/hooks/transaksi-pembelian/use-purchase-orders"
import {
  usePurchaseBillDetail,
  useCreatePurchaseBill,
  useUpdatePurchaseBill,
} from "@/hooks/transaksi-pembelian/use-purchase-bills"
import { ProductPickerDialog, type PickedProduct } from "./product-picker-dialog"
import type { PurchaseBillItemFormData } from "@/types/transaksi-pembelian/purchase-bill"

interface Props {
  mode: "create" | "edit"
  id?: string
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val)
}

function RequiredStar() {
  return <span className="text-red-500">*</span>
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4">
      <Label className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}{required && <RequiredStar />}
      </Label>
      <div className="flex-1">{children}</div>
    </div>
  )
}

function ProductImage({ src, alt }: { src?: string | null; alt: string }) {
  const [failed, setFailed] = useState(false)
  return (
    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted/40">
      {src && !failed ? (
        <img src={src} alt={alt} className="size-full object-cover" onError={() => setFailed(true)} />
      ) : (
        <ImageIcon className="size-4 text-muted-foreground" />
      )}
    </div>
  )
}

export function TagihanFormPage({ mode, id }: Props) {
  const router = useRouter()
  const { data: existingBill, isLoading: loadingBill } = usePurchaseBillDetail(mode === "edit" ? id : undefined)
  const createMut = useCreatePurchaseBill()
  const updateMut = useUpdatePurchaseBill()

  const [purchaseOrderId, setPurchaseOrderId] = useState("")
  const [contactId, setContactId] = useState("")
  const [locationId, setLocationId] = useState("")
  const [billDate, setBillDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [refNo, setRefNo] = useState("")
  const [paymentTerm, setPaymentTerm] = useState("0")
  const [tag, setTag] = useState("")
  const [notes, setNotes] = useState("")
  const [paymentAmount, setPaymentAmount] = useState("")
  const [items, setItems] = useState<(PurchaseBillItemFormData & { thumbnail?: string | null; variant_label?: string })[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)

  const { data: contactsData } = useContacts({ per_page: 100, "filter[type]": "SUPPLIER" })
  const { data: locData } = useLocations({ perPage: 100 })
  const { data: poData } = usePurchaseOrders({ "filter[status]": "OPEN", per_page: 50 })

  useEffect(() => {
    if (mode === "edit" && existingBill) {
      setPurchaseOrderId(existingBill.purchase_order_id ?? "")
      setContactId(existingBill.contact_id)
      setLocationId(existingBill.location_id)
      setBillDate(existingBill.bill_date ? new Date(existingBill.bill_date) : undefined)
      setDueDate(existingBill.due_date ? new Date(existingBill.due_date) : undefined)
      setRefNo(existingBill.ref_no ?? "")
      setPaymentTerm(existingBill.payment_term?.toString() ?? "0")
      setTag(existingBill.tag ?? "")
      setNotes(existingBill.notes ?? "")
      setPaymentAmount(existingBill.paid_amount?.toString() ?? "")
      setItems(existingBill.items.map((it) => ({
        item_id: it.item_id,
        purchase_order_item_id: it.purchase_order_item_id ?? undefined,
        product_name: it.product?.name ?? "",
        product_sku: it.product?.sku ?? "",
        description: it.description ?? "",
        unit: it.unit ?? "",
        qty: it.qty,
        unit_price: Number(it.unit_price),
        disc: Number(it.disc),
        thumbnail: null,
      })))
    }
  }, [mode, existingBill])

  const contactOptions = useMemo(() =>
    (contactsData?.items ?? []).map((c) => ({ value: c.id, label: c.name })),
  [contactsData])

  const locationOptions = useMemo(() =>
    (locData?.items ?? []).map((l) => ({ value: l.id, label: l.locationName })),
  [locData])

  const poOptions = useMemo(() => [
    { value: "", label: "Tanpa Pesanan" },
    ...(poData?.items ?? []).map((po) => ({ value: po.id, label: po.po_number })),
  ], [poData])

  const updateItem = useCallback((index: number, field: string, value: string | number) => {
    setItems((prev) => prev.map((it, i) => i === index ? { ...it, [field]: value } : it))
  }, [])

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handlePickProducts = useCallback((picked: PickedProduct[]) => {
    setItems((prev) => {
      const next = [...prev]
      for (const p of picked) {
        const exists = next.findIndex((it) => it.item_id === p.itemId)
        if (exists >= 0) {
          next[exists] = { ...next[exists], qty: next[exists].qty + 1 }
        } else {
          next.push({
            item_id: p.itemId,
            product_name: p.name,
            product_sku: p.sku,
            qty: 1,
            unit_price: p.sellPrice ?? 0,
            disc: 0,
            thumbnail: p.thumbnail,
            variant_label: p.variantLabel,
          })
        }
      }
      return next
    })
  }, [])

  const existingItemIds = useMemo(() => items.map((it) => it.item_id).filter(Boolean), [items])

  const totals = useMemo(() => {
    let subTotal = 0
    let totalDisc = 0
    let totalQty = 0
    let count = 0
    for (const it of items) {
      if (!it.item_id) continue
      const line = it.qty * it.unit_price
      const disc = line * (it.disc / 100)
      subTotal += line
      totalDisc += disc
      totalQty += it.qty
      count++
    }
    const grandTotal = subTotal - totalDisc
    const paidAmt = Number(paymentAmount) || 0
    return { subTotal, totalDisc, grandTotal, count, totalQty, remaining: grandTotal - paidAmt }
  }, [items, paymentAmount])

  const canSubmit = contactId && locationId && billDate && items.length > 0
  const isPending = createMut.isPending || updateMut.isPending

  function handleSubmit() {
    if (!canSubmit) return
    const payload = {
      purchase_order_id: purchaseOrderId || undefined,
      contact_id: contactId,
      location_id: locationId,
      bill_date: billDate!.toISOString().split("T")[0],
      due_date: dueDate ? dueDate.toISOString().split("T")[0] : undefined,
      ref_no: refNo || undefined,
      payment_term: paymentTerm ? Number(paymentTerm) : null,
      tag: tag || undefined,
      notes: notes || undefined,
      payment_amount: paymentAmount ? Number(paymentAmount) : undefined,
      items: items.filter((it) => it.item_id).map((it) => ({
        item_id: it.item_id,
        purchase_order_item_id: it.purchase_order_item_id,
        description: it.description,
        unit: it.unit,
        qty: it.qty,
        unit_price: it.unit_price,
        disc: it.disc,
      })),
    }

    if (mode === "edit" && id) {
      updateMut.mutate({ id, data: payload }, {
        onSuccess: () => router.push(`/dashboard/transaksi-pembelian/tagihan/${id}`),
      })
    } else {
      createMut.mutate(payload, {
        onSuccess: (data) => router.push(`/dashboard/transaksi-pembelian/tagihan/${data?.id ?? ""}`),
      })
    }
  }

  if (mode === "edit" && loadingBill) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  const activeItems = items.filter((it) => it.item_id)

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title={mode === "create" ? "Tambah Tagihan" : `Edit ${existingBill?.bill_number ?? ""}`}
        backHref="/dashboard/transaksi-pembelian"
        breadcrumb={[
          { label: "Pembelian" },
          { label: "Transaksi Pembelian", href: "/dashboard/transaksi-pembelian" },
          { label: "Tagihan", href: "/dashboard/transaksi-pembelian" },
          { label: mode === "create" ? "Tambah Tagihan" : "Edit" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleSubmit} disabled={!canSubmit || isPending} variant="primary" size="sm">
              {isPending ? <Loader2Icon className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <SaveIcon className="mr-1.5 h-3.5 w-3.5" />}
              Simpan
            </Button>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link href="/dashboard/transaksi-pembelian">
                <XIcon className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-6">
          {/* Header fields */}
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <FieldRow label="No. Tagihan" required>
                <Combobox
                  options={poOptions}
                  value={purchaseOrderId}
                  onChange={(v) => setPurchaseOrderId(v ?? "")}
                  placeholder="Tanpa pesanan"
                  searchPlaceholder="Cari no. pesanan..."
                  className="bg-background"
                />
              </FieldRow>
              <FieldRow label="Termin">
                <Input
                  type="number"
                  min={0}
                  value={paymentTerm}
                  onChange={(e) => setPaymentTerm(e.target.value)}
                  placeholder="0"
                  className="bg-background"
                />
              </FieldRow>
              <FieldRow label="Pemasok" required>
                <Combobox
                  options={contactOptions}
                  value={contactId}
                  onChange={(v) => setContactId(v ?? "")}
                  placeholder="Pilih pemasok"
                  searchPlaceholder="Cari pemasok..."
                  className="bg-background"
                />
              </FieldRow>
              <FieldRow label="Jatuh Tempo" required>
                <DatePicker value={dueDate} onChange={setDueDate} placeholder="Pilih tanggal" className="bg-background" />
              </FieldRow>
              <FieldRow label="No. Ref">
                <Input value={refNo} onChange={(e) => setRefNo(e.target.value)} placeholder="No. ref" className="bg-background" />
              </FieldRow>
              <FieldRow label="Lokasi" required>
                <Combobox
                  options={locationOptions}
                  value={locationId}
                  onChange={(v) => setLocationId(v ?? "")}
                  placeholder="Pilih lokasi"
                  searchPlaceholder="Cari lokasi..."
                  className="bg-background"
                />
              </FieldRow>
              <FieldRow label="Tanggal" required>
                <DatePicker value={billDate} onChange={setBillDate} placeholder="Pilih tanggal" className="bg-background" />
              </FieldRow>
              <FieldRow label="Tag">
                <Input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag" className="bg-background" />
              </FieldRow>
              <div className="flex items-start gap-4 sm:col-start-2">
                <Label className="w-28 shrink-0 pt-2 text-sm text-muted-foreground">Keterangan</Label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Masukkan keterangan disini" rows={3} className="flex-1 bg-background" />
              </div>
            </div>
          </LiquidGlass>

          {/* Product table */}
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5">
            <div className="overflow-x-auto rounded-lg border border-border/40">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-3 py-2.5 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Produk</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">Harga</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-20">Qty</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-24">Diskon %</th>
                    <th className="px-3 py-2.5 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground w-32">Total</th>
                    <th className="px-3 py-2.5 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {activeItems.map((item, idx) => {
                    const lineTotal = item.qty * item.unit_price
                    const discAmount = lineTotal * (item.disc / 100)
                    const total = lineTotal - discAmount
                    return (
                      <tr key={item.item_id} className="border-b border-border/20 last:border-0">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-3">
                            <ProductImage src={item.thumbnail} alt={item.product_name ?? ""} />
                            <div className="min-w-0">
                              <div className="truncate font-medium">{item.product_name}</div>
                              <div className="flex items-center gap-2">
                                <span className="truncate font-mono text-xs text-muted-foreground">{item.product_sku}</span>
                                {item.variant_label && (
                                  <span className="shrink-0 text-xs text-muted-foreground">· {item.variant_label}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            value={item.unit_price || ""}
                            onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                            className="h-8 text-right bg-background tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={1}
                            value={item.qty}
                            onChange={(e) => updateItem(idx, "qty", Math.max(1, Number(e.target.value)))}
                            className="h-8 text-right bg-background tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            value={item.disc || ""}
                            onChange={(e) => updateItem(idx, "disc", Number(e.target.value))}
                            className="h-8 text-right bg-background tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-medium tabular-nums">
                          {formatCurrency(total)}
                        </td>
                        <td className="px-3 py-2">
                          <Button variant="ghost" size="icon-sm" onClick={() => removeItem(idx)} className="text-destructive hover:text-destructive">
                            <Trash2Icon className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                  {activeItems.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-3 py-12 text-center text-muted-foreground">
                        <PackageIcon className="mx-auto mb-2 h-8 w-8" />
                        <p className="text-sm">Belum ada produk. Klik tombol di bawah untuk menambahkan.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4">
              <Button variant="primary" size="sm" onClick={() => setPickerOpen(true)}>
                <PlusIcon className="mr-1.5 h-3.5 w-3.5" />
                Tambah Baru
              </Button>
            </div>
          </LiquidGlass>
        </div>

        {/* Rincian sidebar */}
        <div>
          <LiquidGlass radius={16} intensity="subtle" className="bg-white/30 dark:bg-white/[0.04] p-5 sticky top-4">
            <h3 className="mb-4 font-semibold">Rincian</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {totals.count} Produk ({totals.totalQty} Qty)
                </span>
                <span className="tabular-nums">{formatCurrency(totals.subTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Diskon</span>
                <span className="tabular-nums">{formatCurrency(totals.totalDisc)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pajak</span>
                <span className="tabular-nums">{formatCurrency(0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Biaya Tambahan</span>
                <span className="tabular-nums text-primary">{formatCurrency(0)}</span>
              </div>
              <div className="border-t border-border/40 pt-3">
                <div className="flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(totals.grandTotal)}</span>
                </div>
              </div>

              <div className="border-t border-border/40 pt-3 space-y-2">
                <Label className="text-xs text-muted-foreground">Pembayaran</Label>
                <Input
                  type="number"
                  min={0}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0"
                  className="h-9 text-right bg-background tabular-nums"
                />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sisa</span>
                  <span className={cn("font-medium tabular-nums", totals.remaining > 0 ? "text-amber-600" : "text-emerald-600")}>
                    {formatCurrency(Math.max(0, totals.remaining))}
                  </span>
                </div>
              </div>
            </div>
          </LiquidGlass>
        </div>
      </div>

      <ProductPickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onPick={handlePickProducts}
        excludeIds={existingItemIds}
      />
    </div>
  )
}
