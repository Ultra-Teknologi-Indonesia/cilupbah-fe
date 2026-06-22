"use client"

import { formatIDR } from "../product-columns"
import type { DetailVariant } from "@/types/master-produk"

const num = (n: number | null | undefined) =>
  n == null ? "—" : new Intl.NumberFormat("id-ID").format(n)

export function VariantTable({ variants }: { variants: DetailVariant[] }) {
  if (variants.length === 0) {
    return (
      <p className="px-1 py-6 text-center text-sm text-muted-foreground">
        Belum ada varian.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[680px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 text-left text-xs font-medium text-muted-foreground">
            <th className="px-3 py-2.5">SKU</th>
            <th className="px-3 py-2.5">Harga jual</th>
            <th className="px-3 py-2.5">Harga beli</th>
            <th className="px-3 py-2.5">Pajak</th>
            <th className="px-3 py-2.5 text-right">Stok</th>
            <th className="px-3 py-2.5 text-right">Min / Aman</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr
              key={v.id}
              className="border-b border-border/40 last:border-0 hover:bg-muted/30"
            >
              <td className="px-3 py-2.5">
                <div className="font-mono text-xs text-primary">{v.sku}</div>
                {v.barcode && (
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {v.barcode}
                  </div>
                )}
              </td>
              <td className="px-3 py-2.5 tabular-nums">{formatIDR(v.sellPrice)}</td>
              <td className="px-3 py-2.5 tabular-nums text-muted-foreground">
                {formatIDR(v.buyPrice)}
              </td>
              <td className="px-3 py-2.5 text-muted-foreground">
                {v.salesTax ? v.salesTax.name : "—"}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {v.stock ? (
                  <span title={`Tersedia ${num(v.stock.available)} · Terpesan ${num(v.stock.reserved)}`}>
                    {num(v.stock.onHand)}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
                {num(v.minStock)} / {num(v.safeStock)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
