"use client";

import * as React from "react";
import { BoxIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useItemStock } from "@/hooks/persediaan/use-stock-position";
import type { BinInventory } from "@/types/persediaan/stock";

interface Props {
  itemId: string | null;
  sku?: string;
  productName?: string;
  onOpenChange: (open: boolean) => void;
}

export function AlokasiRakDialog({
  itemId,
  sku,
  productName,
  onOpenChange,
}: Props) {
  const { data, isLoading } = useItemStock(itemId ?? "");
  const bins: BinInventory[] = (data?.data ?? []).filter((b) => b.bin_code);

  return (
    <Dialog open={!!itemId} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Alokasi Rak</DialogTitle>
          <DialogDescription>
            {productName ? `${productName} — ` : ""}
            {sku}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2 py-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : bins.length === 0 ? (
          <EmptyState
            icon={BoxIcon}
            className="py-12"
            title="Belum ada alokasi rak"
            description="SKU ini belum ditempatkan di rak mana pun."
          />
        ) : (
          <div className="max-h-[60vh] overflow-y-auto rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/60">
                  <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                    Lokasi
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-xs uppercase tracking-wider text-muted-foreground">
                    Kode Rak
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
                    On Hand
                  </TableHead>
                  <TableHead className="px-3 py-2.5 text-right text-xs uppercase tracking-wider text-muted-foreground">
                    Available
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bins.map((b) => (
                  <TableRow
                    key={b.id}
                    className="border-b border-border/40 last:border-0"
                  >
                    <TableCell className="px-3 py-2.5 text-sm">
                      {b.location_name}
                      {b.zone_name ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {b.zone_name}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <code className="rounded-lg bg-muted/60 px-1.5 py-0.5 text-xs font-medium">
                        {b.bin_code}
                      </code>
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right font-semibold tabular-nums">
                      {b.on_hand}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "px-3 py-2.5 text-right font-semibold tabular-nums",
                        b.available < 0 ? "text-destructive" : "text-success",
                      )}
                    >
                      {b.available}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
