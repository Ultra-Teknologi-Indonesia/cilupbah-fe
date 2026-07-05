import * as React from "react";
import { cn } from "@/lib/utils";
import { CopySku } from "@/components/dashboard/shared/copy-sku";

interface ProductVariantCellProps {
  name: string | null | undefined;
  variant?: string | string[] | null;
  sku?: string | null;
  thumbnail?: React.ReactNode;
  className?: string;
  maxWidth?: number | string;
  emphasis?: "default" | "strong";
  /**
   * When true, render the SKU as a click-to-copy control (with toast) instead of
   * plain text. Use this whenever the cell lives inside a clickable row so users
   * can copy the SKU without triggering the row's navigation.
   */
  copyableSku?: boolean;
}

export function ProductVariantCell({
  name,
  variant,
  sku,
  thumbnail,
  className,
  maxWidth = 280,
  emphasis = "default",
  copyableSku = false,
}: ProductVariantCellProps) {
  const variantText = Array.isArray(variant)
    ? variant.filter(Boolean).join(", ")
    : variant;

  return (
    <div
      className={cn("flex items-start gap-2 min-w-0", className)}
      style={{
        maxWidth: typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth,
      }}
    >
      {thumbnail}
      <div className="flex min-w-0 flex-col gap-0.5">
        <span
          className={cn(
            "whitespace-normal break-words text-foreground",
            emphasis === "strong" ? "font-semibold" : "font-medium",
          )}
        >
          {name || "—"}
        </span>
        {variantText && (
          <span className="whitespace-normal break-words text-xs text-foreground">
            {variantText}
          </span>
        )}
        {sku &&
          (copyableSku ? (
            <CopySku sku={sku} className="self-start" />
          ) : (
            <span className="font-mono text-[11px] text-foreground/80">
              {sku}
            </span>
          ))}
      </div>
    </div>
  );
}
