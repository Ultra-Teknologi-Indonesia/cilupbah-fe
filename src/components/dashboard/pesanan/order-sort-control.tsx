"use client";

import * as React from "react";
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  ClockIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OrderSortControlProps {
  sortDir: "asc" | "desc";
  onSortDirChange: (dir: "asc" | "desc") => void;
  className?: string;
}

export function OrderSortControl({
  sortDir,
  onSortDirChange,
  className,
}: OrderSortControlProps) {
  const isAsc = sortDir === "asc";

  const handleToggle = () => {
    onSortDirChange(isAsc ? "desc" : "asc");
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <Button
        type="button"
        variant={isAsc ? "secondary" : "outline"}
        size="sm"
        onClick={handleToggle}
        title={
          isAsc
            ? "Urutan: Tanggal Terlama ke Terbaru (Cut-Off FIFO). Klik untuk ubah ke Terbaru."
            : "Urutan: Tanggal Terbaru ke Terlama. Klik untuk ubah ke Terlama (Cut-Off FIFO)."
        }
        className={cn(
          "h-9 gap-1.5 rounded-full px-3 text-xs transition-all",
          isAsc
            ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/15 font-medium shadow-2xs"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {isAsc ? (
          <>
            <ArrowUpNarrowWideIcon className="size-3.5 text-primary shrink-0 animate-in fade-in zoom-in-75 duration-150" />
            <span>Terlama (Cut-Off)</span>
          </>
        ) : (
          <>
            <ArrowDownWideNarrowIcon className="size-3.5 shrink-0 transition-transform" />
            <span>Terbaru</span>
          </>
        )}
      </Button>
    </div>
  );
}
