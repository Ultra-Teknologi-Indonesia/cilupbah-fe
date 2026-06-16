"use client"

import { PackageIcon } from "lucide-react"

import type { BundleComponent } from "@/types/master-produk"

/**
 * Tab Komposisi (bundle): daftar produk komponen penyusun bundle.
 * Bundle dijual sebagai 1 SKU; di sini ditampilkan isinya (qty + stok komponen).
 */
export function TabKomposisi({ components }: { components: BundleComponent[] }) {
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
    <div className="overflow-x-auto rounded-lg border border-border/60 bg-card">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-3 py-2.5">Produk komponen</th>
            <th className="px-3 py-2.5">SKU</th>
            <th className="px-3 py-2.5 text-center">Qty</th>
            <th className="px-3 py-2.5 text-right">Stok tersedia</th>
          </tr>
        </thead>
        <tbody>
          {components.map((c) => (
            <tr
              key={c.componentVariantId}
              className="border-b border-border/40 last:border-0 align-top hover:bg-muted/30"
            >
              <td className="px-3 py-2.5">
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
              </td>
              <td className="px-3 py-2.5 font-mono text-xs text-primary">{c.sku ?? "—"}</td>
              <td className="px-3 py-2.5 text-center tabular-nums">
                <span className="inline-flex min-w-7 items-center justify-center rounded-md bg-primary/10 px-1.5 py-0.5 font-medium text-primary">
                  ×{c.qty}
                </span>
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">
                {c.stock ? (
                  <span className={c.stock.available <= 0 ? "text-destructive" : "text-foreground"}>
                    {c.stock.available}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
