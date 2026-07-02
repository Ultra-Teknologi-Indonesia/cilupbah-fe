"use client"

import { AlertTriangleIcon, PackageIcon, LayersIcon } from "lucide-react"

import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import type { BundleComponent } from "@/types/master-produk"

type BundleStock = { onHand: number; reserved: number; onOrder: number; available: number } | null


export function TabKomposisi({
  components,
  bundleStock,
}: {
  components: BundleComponent[]
  bundleStock?: BundleStock
}) {
  
  const blocking = components.filter((c) => (c.stock?.available ?? 0) < c.qty)
  const derivedAvailable = bundleStock?.available ?? 0

  if (components.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border/60 bg-card/40 px-6 py-12 text-center">
        <PackageIcon className="size-7 text-muted-foreground" />
        <p className="text-sm font-medium">Belum ada komponen</p>
        <p className="text-xs text-muted-foreground">Bundle ini belum memiliki produk penyusun.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border/60 bg-card/60 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LayersIcon className="size-4.5" />
          </span>
          <div>
            <div className="text-xs text-muted-foreground">Stok bundle (dapat dirakit)</div>
            <div className="text-lg font-semibold tabular-nums">{derivedAvailable}</div>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Stok turunan dari komponen — tidak diatur langsung.
        </p>
      </div>

      {blocking.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          <p>
            {blocking.length === components.length
              ? "Semua komponen kurang stok"
              : `${blocking.length} komponen kurang stok`}
            {" "}— bundle tidak dapat dirakit hingga stok komponen mencukupi.
          </p>
        </div>
      )}

      <Table className="min-w-[640px] border-collapse" containerClassName="rounded-lg border border-border/60 bg-card">
        <TableHeader>
          <TableRow className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
            <TableHead className="px-3 py-2.5 text-xs font-normal text-muted-foreground">Produk komponen</TableHead>
            <TableHead className="px-3 py-2.5 text-xs font-normal text-muted-foreground">SKU</TableHead>
            <TableHead className="px-3 py-2.5 text-center text-xs font-normal text-muted-foreground">Qty</TableHead>
            <TableHead className="px-3 py-2.5 text-right text-xs font-normal text-muted-foreground">Stok tersedia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((c) => (
            <TableRow
              key={c.componentVariantId}
              className="border-b border-border/40 last:border-0 align-top hover:bg-muted/30"
            >
              <TableCell className="px-3 py-2.5 whitespace-normal">
                <div className="font-medium text-foreground">{c.product?.name ?? "—"}</div>
                {c.variationValues.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {c.variationValues.map((o, i) => (
                      <span key={i} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-foreground/80">
                        {o.value}
                      </span>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="px-3 py-2.5 font-mono text-xs text-primary">{c.sku ?? "—"}</TableCell>
              <TableCell className="px-3 py-2.5 text-center tabular-nums">
                <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                  ×{c.qty}
                </span>
              </TableCell>
              <TableCell className="px-3 py-2.5 text-right tabular-nums">
                {c.stock ? (
                  <span
                    className={
                      c.stock.available < c.qty
                        ? "font-medium text-destructive"
                        : "text-foreground"
                    }
                    title={c.stock.available < c.qty ? "Kurang dari kebutuhan 1 bundle" : undefined}
                  >
                    {c.stock.available}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
