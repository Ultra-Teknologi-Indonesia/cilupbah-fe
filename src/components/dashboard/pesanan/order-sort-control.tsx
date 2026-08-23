"use client";

import * as React from "react";
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  ArrowUpDownIcon,
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export const SORT_FIELD_OPTIONS = [
  { value: "transaction_date", label: "Tgl. Transaksi (Pesanan)" },
  { value: "created_at", label: "Tgl. Ditarik Sistem" },
  { value: "delivery_deadline", label: "Batas Kirim" },
  { value: "salesorder_no", label: "No. Pesanan Internal" },
  { value: "channel_order_no", label: "No. Pesanan Channel (Ref)" },
  { value: "grand_total", label: "Total Pembayaran" },
] as const;

export type SortField = (typeof SORT_FIELD_OPTIONS)[number]["value"];

interface OrderSortControlProps {
  sortDir: "asc" | "desc";
  onSortDirChange: (dir: "asc" | "desc") => void;
  sortBy?: string;
  onSortByChange?: (by: string) => void;
  className?: string;
}

export function OrderSortControl({
  sortDir,
  onSortDirChange,
  sortBy = "transaction_date",
  onSortByChange,
  className,
}: OrderSortControlProps) {
  const isAsc = sortDir === "asc";

  const handleToggleDirection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSortDirChange(isAsc ? "desc" : "asc");
  };

  const activeFieldLabel =
    SORT_FIELD_OPTIONS.find((f) => f.value === sortBy)?.label ??
    "Tgl. Transaksi";

  const isCustomSort = sortBy !== "transaction_date" || isAsc;

  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <DropdownMenu>
        <div
          className={cn(
            "inline-flex items-center rounded-full border transition-all",
            isCustomSort
              ? "border-primary/40 bg-primary/10 text-primary shadow-2xs"
              : "border-border bg-background text-muted-foreground hover:text-foreground",
          )}
        >
          {/* Quick toggle arrow */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleToggleDirection}
            title={
              isAsc
                ? `Urutan: ${activeFieldLabel} (Terlama ke Terbaru / FIFO). Klik untuk balik urutan.`
                : `Urutan: ${activeFieldLabel} (Terbaru ke Terlama). Klik untuk balik urutan.`
            }
            className={cn(
              "h-9 gap-1.5 rounded-l-full rounded-r-none px-3 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5",
              isCustomSort && "text-primary hover:text-primary",
            )}
          >
            {isAsc ? (
              <>
                <ArrowUpNarrowWideIcon className="size-3.5 shrink-0 text-primary animate-in fade-in zoom-in-75 duration-150" />
                <span>Terlama (Cut-Off)</span>
              </>
            ) : (
              <>
                <ArrowDownWideNarrowIcon className="size-3.5 shrink-0 transition-transform" />
                <span>
                  {sortBy === "transaction_date" ? "Terbaru" : activeFieldLabel}
                </span>
              </>
            )}
          </Button>

          {/* Dropdown trigger to choose sort field */}
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label="Pilih kolom pengurutan"
              title="Pilih kolom pengurutan lainnya"
              className={cn(
                "h-9 w-7 rounded-l-none rounded-r-full p-0 border-l border-border/40 hover:bg-black/5 dark:hover:bg-white/5",
                isCustomSort &&
                  "border-primary/30 text-primary hover:text-primary",
              )}
            >
              <ChevronDownIcon className="size-3.5 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
        </div>

        <DropdownMenuContent
          align="end"
          className="w-56 rounded-2xl p-1.5 shadow-xl"
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground font-normal">
            Urutkan Berdasarkan
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {SORT_FIELD_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.value;
            return (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => onSortByChange?.(opt.value)}
                className={cn(
                  "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer",
                  isSelected && "bg-primary/10 text-primary font-medium",
                )}
              >
                <span>{opt.label}</span>
                {isSelected && (
                  <CheckIcon className="size-3.5 text-primary shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground font-normal">
            Arah Urutan
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => onSortDirChange("desc")}
            className={cn(
              "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer",
              !isAsc && "bg-primary/10 text-primary font-medium",
            )}
          >
            <div className="flex items-center gap-2">
              <ArrowDownWideNarrowIcon className="size-3.5" />
              <span>Terbaru ke Terlama</span>
            </div>
            {!isAsc && <CheckIcon className="size-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => onSortDirChange("asc")}
            className={cn(
              "flex items-center justify-between rounded-xl px-2.5 py-2 text-xs cursor-pointer",
              isAsc && "bg-primary/10 text-primary font-medium",
            )}
          >
            <div className="flex items-center gap-2">
              <ArrowUpNarrowWideIcon className="size-3.5 text-primary" />
              <span>Terlama ke Terbaru (Cut-Off FIFO)</span>
            </div>
            {isAsc && <CheckIcon className="size-3.5 text-primary shrink-0" />}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
