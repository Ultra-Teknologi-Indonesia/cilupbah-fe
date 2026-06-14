import { cn } from "@/lib/utils"
import type { Product } from "../_data/mock-products"
import { formatIDR } from "./product-columns"

// Expanded sub-row: per-variant breakdown of a master product.
export function ProductVariantDetail({ product }: { product: Product }) {
  return (
    <div className="px-14 py-3">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th className="py-1.5 pr-4 font-medium">SKU</th>
            <th className="py-1.5 pr-4 font-medium">Variasi</th>
            <th className="py-1.5 pr-4 text-right font-medium">Harga</th>
            <th className="py-1.5 pr-4 text-right font-medium">Tersedia</th>
            <th className="py-1.5 pr-4 text-right font-medium">Stok Fisik</th>
            <th className="py-1.5 font-medium">Toko</th>
          </tr>
        </thead>
        <tbody>
          {product.variants.map((v) => (
            <tr key={v.itemId} className="border-t border-border/60">
              <td className="py-2 pr-4 font-mono text-xs">{v.sku}</td>
              <td className="py-2 pr-4">
                {v.variationValues.length ? (
                  <div className="flex flex-wrap gap-1">
                    {v.variationValues.map((vv) => (
                      <span
                        key={vv.label}
                        className="rounded-md bg-muted px-1.5 py-0.5 text-xs"
                      >
                        {vv.label}: {vv.value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Default</span>
                )}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums">
                {formatIDR(v.sellPrice)}
              </td>
              <td
                className={cn(
                  "py-2 pr-4 text-right tabular-nums",
                  v.stock.available === 0 && "text-destructive font-medium"
                )}
              >
                {v.stock.available}
              </td>
              <td className="py-2 pr-4 text-right tabular-nums text-muted-foreground">
                {v.stock.onHand}
              </td>
              <td className="py-2 text-xs text-muted-foreground">
                {v.storeNames.length
                  ? v.storeNames.map((s) => s.storeName).join(", ")
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
