"use client"

import type { ReactNode } from "react"

import type { ProductDetail } from "@/types/master-produk"

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right">{value ?? "—"}</span>
    </div>
  )
}

const acc = (a: { code: string; name: string } | null) =>
  a ? `${a.code} · ${a.name}` : "—"

const yn = (b: boolean) => (b ? "Ya" : "Tidak")

export function AccountsCard({ product }: { product: ProductDetail }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <h3 className="mb-2 text-sm font-medium">Akun &amp; transaksi</h3>
      <Row label="Akun penjualan" value={acc(product.accounts.sales)} />
      <Row label="Akun retur penjualan" value={acc(product.accounts.salesReturn)} />
      <Row label="Akun persediaan" value={acc(product.accounts.inventory)} />
      <Row label="Akun HPP" value={acc(product.accounts.cogs)} />
      <Row
        label="Tipe pesanan"
        value={product.isPo ? `Pre-Order (${product.indentDays ?? 0} hari)` : "Reguler"}
      />
      <Row
        label="Dijual / Dibeli / Disimpan"
        value={`${yn(product.isSold)} · ${yn(product.isPurchased)} · ${yn(product.isStored)}`}
      />
      {product.isPurchased && (
        <Row label="Lead time pembelian" value={`${product.purchaseLeadTime ?? 0} hari`} />
      )}
    </div>
  )
}

export function ShippingCard({ product }: { product: ProductDetail }) {
  const hasDim = [product.length, product.width, product.height].some(
    (v) => v != null && Number(v) > 0
  )
  const dim = hasDim
    ? `${product.length ?? 0} × ${product.width ?? 0} × ${product.height ?? 0} cm`
    : "—"
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:p-5">
      <h3 className="mb-2 text-sm font-medium">Pengiriman</h3>
      <Row label="Berat" value={product.weight != null ? `${product.weight} kg` : "—"} />
      <Row label="Dimensi (P×L×T)" value={dim} />
      <Row label="Isi paket" value={product.packageContents || "—"} />
      <Row label="Konsinyasi" value={yn(product.isConsignment)} />
    </div>
  )
}
