"use client";

import * as React from "react";
import { CheckIcon, ChevronsUpDownIcon, PlusIcon, SearchIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { LookupOption } from "@/types/common";


export type ComboboxOption = LookupOption;

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  id?: string;
  invalid?: boolean;
  className?: string;
  onCreateOption?: (query: string) => void;
  createLabel?: (query: string) => string;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Pilih…",
  searchPlaceholder = "Cari item",
  emptyText = "Tidak ditemukan.",
  disabled,
  id,
  invalid,
  className,
  onCreateOption,
  createLabel = (q) => `Buat "${q}"`,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = options.find((o) => o.value === value) ?? null;
  const trimmed = query.trim();
  const filtered = trimmed
    ? options.filter((o) =>
        o.label.toLowerCase().includes(trimmed.toLowerCase()),
      )
    : options;
  const showCreate = onCreateOption && trimmed;
  const exactMatch = options.some(
    (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
  );

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (o) setQuery("");
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between gap-2 rounded-full border border-border bg-background px-3 text-sm outline-none transition-[color,box-shadow]",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive ring-3 ring-destructive/20",
            className,
          )}
        >
          <span
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) gap-0 p-0"
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-3">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onCreateOption && trimmed) {
                e.preventDefault();
                if (!exactMatch) {
                  onCreateOption(trimmed);
                } else {
                  const match = options.find(
                    (o) => o.label.toLowerCase() === trimmed.toLowerCase(),
                  );
                  if (match) onChange(match.value);
                }
                setQuery("");
                setOpen(false);
              }
            }}
            placeholder={searchPlaceholder}
            className="h-10 border-0 bg-transparent px-0 focus-visible:ring-0"
          />
        </div>
        <div className="max-h-64 overflow-y-auto overscroll-contain">
          <ul className="p-1.5">
            {filtered.length === 0 && (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                {emptyText}
              </li>
            )}
            {filtered.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(isSelected ? null : opt.value);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-full px-2.5 py-2 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/60",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <CheckIcon
                        className={cn(
                          "size-4",
                          isSelected ? "opacity-100" : "opacity-0",
                        )}
                      />
                      <span className="truncate">{opt.label}</span>
                    </span>
                    {opt.hint && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {opt.hint}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
            {showCreate && !exactMatch && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onCreateOption!(trimmed);
                    setQuery("");
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-full px-2.5 py-2 text-left text-sm text-primary transition-colors hover:bg-primary/10"
                >
                  <PlusIcon className="size-4" />
                  <span>{createLabel(trimmed)}</span>
                </button>
              </li>
            )}
            {onCreateOption && !trimmed && (
              <li className="border-t border-border/60 mt-1 pt-1">
                <div className="px-2.5 py-2 text-xs text-muted-foreground">
                  Ketik nama lalu tekan Enter untuk membuat jenis varian baru
                </div>
              </li>
            )}
          </ul>
        </div>
      </PopoverContent>
    </Popover>
  );
}
