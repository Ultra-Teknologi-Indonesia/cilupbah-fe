"use client"

import * as React from "react"
import { PackageIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Product } from "../_data/mock-products"
import { formatIDR } from "./product-columns"

function variantName(values: { label: string; value: string }[]) {
  if (values.length === 0) return "Varian tunggal"
  return values.map((v) => v.value).join(" / ")
}

// "X varian" trigger that reveals the variant list (name + SKU) on hover or
// click. Glass popover styling comes from the shared <PopoverContent>.
export function ProductVariantPopover({ product }: { product: Product }) {
  const [open, setOpen] = React.useState(false)
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }
  const openNow = () => {
    cancelClose()
    setOpen(true)
  }
  const closeSoon = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), 120)
  }

  React.useEffect(() => cancelClose, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1 -mx-1 text-xs text-muted-foreground transition-colors",
            "hover:text-foreground data-[state=open]:text-foreground"
          )}
        >
          <PackageIcon className="size-3" />
          {product.totalVariants} varian
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        onMouseEnter={openNow}
        onMouseLeave={closeSoon}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="w-72 gap-2 p-2"
      >
        <p className="px-2 pt-1 text-xs font-medium text-muted-foreground">
          {product.variants.length} varian
        </p>
        <ScrollArea className="max-h-72">
          <ul className="flex flex-col gap-0.5 pr-2.5">
            {product.variants.map((v) => (
              <li
                key={v.itemId}
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {variantName(v.variationValues)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {v.sku}
                  </p>
                </div>
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                  {formatIDR(v.sellPrice)}
                </span>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
