"use client";

import Image from "next/image";
import { PackageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/master-produk";
import { useVariantStocks } from "@/hooks/master-produk/use-variant-stocks";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatIDR } from "./product-columns";

export function ProductVariantDetail({ product }: { product: Product }) {
  const itemIds = product.variants.map((v) => v.itemId);
  const { data: stocks = {}, isLoading } = useVariantStocks(itemIds);

  return (
    <div className="px-14 py-3">
      <Table containerClassName="overflow-visible">
        <TableHeader>
          <TableRow className="text-left text-xs text-muted-foreground hover:bg-transparent">
            <TableHead className="h-auto py-1.5 pr-4 px-0 text-xs font-medium text-muted-foreground">
              SKU
            </TableHead>
            <TableHead className="h-auto py-1.5 pr-4 px-0 text-xs font-medium text-muted-foreground">
              Variasi
            </TableHead>
            <TableHead className="h-auto py-1.5 pr-4 px-0 text-right text-xs font-medium text-muted-foreground">
              Harga
            </TableHead>
            <TableHead className="h-auto py-1.5 pr-4 px-0 text-right text-xs font-medium text-muted-foreground">
              Tersedia
            </TableHead>
            <TableHead className="h-auto py-1.5 pr-4 px-0 text-right text-xs font-medium text-muted-foreground">
              Stok Fisik
            </TableHead>
            <TableHead className="h-auto py-1.5 px-0 text-xs font-medium text-muted-foreground">
              Toko
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {product.variants.map((v) => {
            const st = stocks[v.itemId];
            const variantThumb = v.thumbnail ?? product.thumbnail;
            return (
              <TableRow
                key={v.itemId}
                className="border-t border-border/60 hover:bg-transparent"
              >
                <TableCell className="py-2 pr-4 px-0 font-mono text-xs">
                  <div className="flex items-center gap-2.5">
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
                    <span>{v.sku}</span>
                  </div>
                </TableCell>
                <TableCell className="py-2 pr-4 px-0 whitespace-normal">
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
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="py-2 pr-4 px-0 text-right tabular-nums">
                  {formatIDR(v.sellPrice)}
                </TableCell>
                <TableCell
                  className={cn(
                    "py-2 pr-4 px-0 text-right tabular-nums",
                    st?.available === 0 && "text-destructive font-medium",
                  )}
                >
                  {isLoading ? "…" : (st?.available ?? "—")}
                </TableCell>
                <TableCell className="py-2 pr-4 px-0 text-right tabular-nums text-foreground">
                  {isLoading ? "…" : (st?.onHand ?? "—")}
                </TableCell>
                <TableCell className="py-2 px-0 whitespace-normal text-xs text-foreground">
                  {v.storeNames.length
                    ? v.storeNames.map((s) => s.storeName).join(", ")
                    : "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
