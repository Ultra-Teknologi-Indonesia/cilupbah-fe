import * as React from "react"
import { cn } from "@/lib/utils"

interface ProductVariantCellProps {
  name: string | null | undefined
  variant?: string | string[] | null
  sku?: string | null
  thumbnail?: React.ReactNode
  className?: string
  maxWidth?: number | string  // default 280px
  emphasis?: "default" | "strong"
}

// Tampilan standar nama produk + opsi varian di tabel.
// - Nama produk: medium weight, hitam (text-foreground)
// - Opsi varian: weight normal, hitam, ukuran lebih kecil
// - SKU: jika ada, font-mono kecil hitam
// - Selalu wrap (break-words), dengan max-width terbatas agar tidak mendorong kolom lain.
export function ProductVariantCell({
  name,
  variant,
  sku,
  thumbnail,
  className,
  maxWidth = 280,
  emphasis = "default",
}: ProductVariantCellProps) {
  const variantText = Array.isArray(variant) ? variant.filter(Boolean).join(", ") : variant

  return (
    <div
      className={cn("flex items-start gap-2 min-w-0", className)}
      style={{ maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth }}
    >
      {thumbnail}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            "whitespace-normal break-words text-foreground",
            emphasis === "strong" ? "font-semibold" : "font-medium"
          )}
        >
          {name || "—"}
        </span>
        {variantText && (
          <span className="whitespace-normal break-words text-xs text-foreground">
            {variantText}
          </span>
        )}
        {sku && (
          <span className="font-mono text-[11px] text-foreground/80">
            {sku}
          </span>
        )}
      </div>
    </div>
  )
}
