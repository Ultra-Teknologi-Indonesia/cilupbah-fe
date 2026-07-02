"use client"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
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
    <Table className="min-w-[680px] border-collapse">
      <TableHeader>
        <TableRow className="border-b border-border/60 text-left text-xs font-medium text-muted-foreground">
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">SKU</TableHead>
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">Harga jual</TableHead>
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">Harga beli</TableHead>
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">Pajak</TableHead>
          <TableHead className="px-3 py-2.5 text-right text-xs text-muted-foreground">Stok</TableHead>
          <TableHead className="px-3 py-2.5 text-right text-xs text-muted-foreground">Min / Aman</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {variants.map((v) => (
          <TableRow
            key={v.id}
            className="border-b border-border/40 last:border-0 hover:bg-muted/30"
          >
            <TableCell className="px-3 py-2.5">
              <div className="font-mono text-xs text-primary">{v.sku}</div>
              {v.barcode && (
                <div className="font-mono text-[11px] text-muted-foreground">
                  {v.barcode}
                </div>
              )}
            </TableCell>
            <TableCell className="px-3 py-2.5 tabular-nums">{formatIDR(v.sellPrice)}</TableCell>
            <TableCell className="px-3 py-2.5 tabular-nums text-muted-foreground">
              {formatIDR(v.buyPrice)}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-muted-foreground">
              {v.salesTax ? v.salesTax.name : "—"}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right tabular-nums">
              {v.stock ? (
                <span title={`Tersedia ${num(v.stock.available)} · Terpesan ${num(v.stock.reserved)}`}>
                  {num(v.stock.onHand)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">
              {num(v.minStock)} / {num(v.safeStock)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
