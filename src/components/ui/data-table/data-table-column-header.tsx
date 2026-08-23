"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DataTableColumnHeaderProps<
  TData,
  TValue,
> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-xs", className)}>{title}</div>;
  }

  const sorted = column.getIsSorted();

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 h-8 gap-1.5 px-2"
        onClick={() => column.toggleSorting(sorted === "asc")}
      >
        <span>{title}</span>
        {sorted === "desc" ? (
          <ArrowDownIcon className="size-3.5" />
        ) : sorted === "asc" ? (
          <ArrowUpIcon className="size-3.5" />
        ) : (
          <ChevronsUpDownIcon className="size-3.5 opacity-50" />
        )}
      </Button>
    </div>
  );
}
