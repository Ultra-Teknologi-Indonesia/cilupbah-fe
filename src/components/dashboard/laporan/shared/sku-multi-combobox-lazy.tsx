"use client";

import * as React from "react";
import { Check, ChevronsUpDown, ImageIcon, Loader2, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useSkuOptionsInfinite } from "@/hooks/laporan/use-laporan-produk";
import type { SkuOption } from "@/types/laporan/laporan-produk";

interface SkuMultiComboboxLazyProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const DEBOUNCE_MS = 300;

export function SkuMultiComboboxLazy({
  value,
  onChange,
  className,
}: SkuMultiComboboxLazyProps) {
  const [open, setOpen] = React.useState(false);
  const [rawQuery, setRawQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [cache, setCache] = React.useState<Map<string, SkuOption>>(new Map());

  React.useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSkuOptionsInfinite(query, open);

  const options = React.useMemo(
    () => data?.pages.flatMap((p) => p.data) ?? [],
    [data],
  );

  const selected = React.useMemo(
    () => value.map((id) => cache.get(id)).filter(Boolean) as SkuOption[],
    [value, cache],
  );

  function select(o: SkuOption) {
    setCache((prev) => (prev.has(o.id) ? prev : new Map(prev).set(o.id, o)));
    onChange(
      value.includes(o.id)
        ? value.filter((v) => v !== o.id)
        : [...value, o.id],
    );
  }

  function remove(id: string) {
    onChange(value.filter((v) => v !== id));
  }

  const listRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { root: listRef.current, rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage, options.length]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-auto min-h-10 w-full justify-between rounded-3xl py-1.5",
            className,
          )}
        >
          <span className="flex flex-1 flex-wrap gap-1 text-left">
            {selected.length === 0 ? (
              <span className="text-muted-foreground">Pilih SKU…</span>
            ) : (
              selected.map((o) => (
                <Badge key={o.id} variant="secondary" className="gap-1">
                  {o.sku}
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label={`Hapus ${o.sku}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(o.id);
                    }}
                    className="ml-0.5 inline-flex rounded-full hover:text-destructive"
                  >
                    <X className="size-3" />
                  </span>
                </Badge>
              ))
            )}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Cari SKU / nama produk…"
            value={rawQuery}
            onValueChange={setRawQuery}
          />
          <CommandList ref={listRef}>
            {options.length === 0 && !isFetching && (
              <CommandEmpty>Produk tidak ditemukan.</CommandEmpty>
            )}
            {options.map((o) => {
              const active = value.includes(o.id);
              return (
                <CommandItem
                  key={o.id}
                  value={o.id}
                  onSelect={() => select(o)}
                  className="flex items-start gap-2"
                >
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      active ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {o.image_url ? (
                    <span
                      className="size-8 shrink-0 rounded-xl bg-muted bg-cover bg-center"
                      style={{ backgroundImage: `url(${o.image_url})` }}
                    />
                  ) : (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <ImageIcon className="size-4" />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm leading-snug break-words whitespace-normal">
                      {o.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {o.sku}
                    </span>
                  </span>
                </CommandItem>
              );
            })}
            <div ref={sentinelRef} aria-hidden />
            {(isFetching || isFetchingNextPage) && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Memuat…
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
