"use client";

import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortableHeaderProps {
  label: string;
  field: string;
  currentSort: string | undefined;
  onSort: (sort: string | undefined) => void;
  className?: string;
  align?: "left" | "right" | "center";
}

export function SortableHeader({
  label,
  field,
  currentSort,
  onSort,
  className,
  align = "left",
}: SortableHeaderProps) {
  const isActive = currentSort === field || currentSort === `-${field}`;
  const isDesc = currentSort === `-${field}`;

  const handleClick = () => {
    if (!isActive) onSort(field);
    else if (!isDesc) onSort(`-${field}`);
    else onSort(undefined);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors",
        align === "right" && "justify-end",
        align === "center" && "justify-center",
        className,
      )}
    >
      {label}
      {!isActive && <ArrowUpDownIcon className="size-3 opacity-60" />}
      {isActive && !isDesc && <ArrowUpIcon className="size-3" />}
      {isActive && isDesc && <ArrowDownIcon className="size-3" />}
    </button>
  );
}
