"use client";

import * as React from "react";
import Image from "next/image";
import { PackageIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Product } from "@/types/master-produk";
import { formatIDR } from "./product-columns";

function variantName(values: { label: string; value: string }[]) {
  if (values.length === 0) return "Varian tunggal";
  return values.map((v) => v.value).join(" / ");
}

export function ProductVariantPopover({ product }: { product: Product }) {
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };
  const openNow = () => {
    cancelClose();
    setOpen(true);
  };
  const closeSoon = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  };

  React.useEffect(() => cancelClose, []);

  const count = product.isBundle
    ? (product.totalComponents ?? product.variants.length ?? 0)
    : product.totalVariants;
  const label = product.isBundle ? "komposisi" : "varian";
  const headerLabel = product.isBundle ? "komponen bundle" : "varian";

  return (
    <Popover modal={false} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          onMouseEnter={openNow}
          onMouseLeave={closeSoon}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "inline-flex items-center gap-1 rounded-md px-1 -mx-1 text-xs text-muted-foreground transition-colors",
            "hover:text-foreground data-[state=open]:text-foreground",
          )}
        >
          <PackageIcon className="size-3" />
          {count} {label}
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
          {product.isBundle ? count : product.variants.length} {headerLabel}
        </p>
        <ScrollArea
          type="always"
          className="max-h-72"
          viewportClassName="[&>div]:!block"
        >
          <ul className="flex flex-col gap-0.5 pr-2.5">
            {product.variants.map((v) => {
              const variantThumb = v.thumbnail ?? product.thumbnail;
              return (
                <li
                  key={v.itemId}
                  className="flex items-center justify-between gap-3 rounded-xl px-2 py-1.5 hover:bg-muted/60"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                      {variantThumb ? (
                        <Image
                          src={variantThumb}
                          alt={v.sku}
                          width={28}
                          height={28}
                          className="size-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <PackageIcon className="size-3.5 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {variantName(v.variationValues)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {v.sku}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {formatIDR(v.sellPrice)}
                  </span>
                </li>
              );
            })}
          </ul>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
