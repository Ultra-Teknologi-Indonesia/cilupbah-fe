"use client";
import { EmptyState } from "@/components/ui/empty-state";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency as formatIDR, formatNumber as num } from "@/lib/format";
import type { DetailVariant } from "@/types/master-produk";

export function VariantTable({ variants }: { variants: DetailVariant[] }) {
  if (variants.length === 0) {
    return (
      <EmptyState title="Belum ada varian." />
    );
  }

  return (
    <Table className="min-w-[680px] border-collapse">
      <TableHeader>
        <TableRow className="border-b border-border/60 text-left text-xs font-medium text-muted-foreground">
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">
            SKU
          </TableHead>
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">
            Harga jual
          </TableHead>
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">
            Harga beli
          </TableHead>
          <TableHead className="px-3 py-2.5 text-xs text-muted-foreground">
            Pajak
          </TableHead>
          <TableHead className="px-3 py-2.5 text-right text-xs text-muted-foreground">
            Stok
          </TableHead>
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
                <div className="font-mono text-2xs text-muted-foreground">
                  {v.barcode}
                </div>
              )}
            </TableCell>
            <TableCell className="px-3 py-2.5 tabular-nums">
              {formatIDR(v.sellPrice)}
            </TableCell>
            <TableCell className="px-3 py-2.5 tabular-nums text-muted-foreground">
              {formatIDR(v.buyPrice)}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-muted-foreground">
              {v.salesTax ? v.salesTax.name : "—"}
            </TableCell>
            <TableCell className="px-3 py-2.5 text-right tabular-nums">
              {v.stock ? (
                <span
                  title={`Tersedia ${num(v.stock.available)} · Terpesan ${num(v.stock.reserved)}`}
                >
                  {num(v.stock.onHand)}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
