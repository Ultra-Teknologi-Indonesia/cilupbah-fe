"use client";

import * as React from "react";
import {
  ChevronDownIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  SearchIcon,
  Trash2Icon,
  XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useMasterProducts } from "@/hooks/master-produk/use-master-products";

export interface BundleComponentValue {
  variantId: string;
  productName: string;
  sku: string | null;
  variationValues?: { value: string }[];
  qty: number;
}

export function BundleBuilder({
  value,
  onChange,
}: {
  value: BundleComponentValue[];
  onChange: (next: BundleComponentValue[]) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isFetching } = useMasterProducts({
    search: debounced || undefined,
    perPage: 20,
  });

  const results = (data?.items ?? []).filter((p) => !p.isBundle);

  const chosen = new Set(value.map((c) => c.variantId));

  const add = (component: BundleComponentValue) => {
    if (chosen.has(component.variantId)) return;
    onChange([...value, component]);
    setOpen(false);
    setSearch("");
    setExpanded(null);
  };

  const setQty = (variantId: string, qty: number) =>
    onChange(
      value.map((c) =>
        c.variantId === variantId ? { ...c, qty: Math.max(1, qty) } : c,
      ),
    );

  const remove = (variantId: string) =>
    onChange(value.filter((c) => c.variantId !== variantId));

  return (
    <div className="flex flex-col gap-3">

      {value.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="Belum ada komponen"
          description="Cari produk untuk ditambahkan ke bundle."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {value.map((c) => (
            <li
              key={c.variantId}
              className="flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {c.productName}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="font-mono text-primary">{c.sku ?? "—"}</span>
                  {(c.variationValues ?? []).map((o, i) => (
                    <span
                      key={i}
                      className="rounded bg-muted px-1.5 py-0.5 text-2xs text-foreground/80"
                    >
                      {o.value}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7"
                  aria-label="Kurangi jumlah"
                  onClick={() => setQty(c.variantId, c.qty - 1)}
                  disabled={c.qty <= 1}
                >
                  <MinusIcon className="size-3.5" />
                </Button>
                <Input
                  type="number"
                  min={1}
                  value={c.qty}
                  onChange={(e) =>
                    setQty(c.variantId, Number(e.target.value) || 1)
                  }
                  className="h-7 w-14 text-center tabular-nums"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-7"
                  aria-label="Tambah jumlah"
                  onClick={() => setQty(c.variantId, c.qty + 1)}
                >
                  <PlusIcon className="size-3.5" />
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-destructive"
                aria-label="Hapus item"
                onClick={() => remove(c.variantId)}
              >
                <Trash2Icon className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative">
        {open ? (
          <div className="rounded-lg border border-border/60 bg-card shadow-sm">
            <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
              <SearchIcon className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk komponen…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                aria-label="Tutup pencarian"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <div className="max-h-72 overflow-y-auto p-1">
              {isFetching && results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Memuat…
                </p>
              ) : results.length === 0 ? (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                  {debounced
                    ? "Produk tidak ditemukan."
                    : "Ketik untuk mencari produk."}
                </p>
              ) : (
                results.map((p) => {
                  const single = p.variants.length <= 1;
                  const variant = p.variants[0];
                  const isExpanded = expanded === p.itemGroupId;
                  return (
                    <div key={p.itemGroupId} className="rounded-md">
                      <button
                        type="button"
                        onClick={() => {
                          if (single && variant) {
                            add({
                              variantId: variant.itemId,
                              productName: p.itemName,
                              sku: variant.sku || p.sku,
                              variationValues: [],
                              qty: 1,
                            });
                          } else {
                            setExpanded(isExpanded ? null : p.itemGroupId);
                          }
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm hover:bg-muted/60"
                      >
                        <span className="min-w-0 flex-1 truncate font-medium">
                          {p.itemName}
                        </span>
                        {single ? (
                          <span className="text-xs text-muted-foreground">
                            {variant?.sku || p.sku || ""}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            {p.variants.length} varian
                            <ChevronDownIcon
                              className={cn(
                                "size-3.5 transition-transform",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </span>
                        )}
                      </button>
                      {!single && isExpanded && (
                        <div className="ml-3 border-l border-border/60 pl-2">
                          {p.variants.map((vr) => {
                            const already = chosen.has(vr.itemId);
                            return (
                              <button
                                key={vr.itemId}
                                type="button"
                                disabled={already}
                                onClick={() =>
                                  add({
                                    variantId: vr.itemId,
                                    productName: p.itemName,
                                    sku: vr.sku,
                                    variationValues: vr.variationValues.map(
                                      (x) => ({ value: x.value }),
                                    ),
                                    qty: 1,
                                  })
                                }
                                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs hover:bg-muted/60 disabled:opacity-40"
                              >
                                <span className="font-mono text-primary">
                                  {vr.sku}
                                </span>
                                {vr.variationValues.map((x, i) => (
                                  <span
                                    key={i}
                                    className="rounded bg-muted px-1.5 py-0.5 text-2xs"
                                  >
                                    {x.value}
                                  </span>
                                ))}
                                {already && (
                                  <span className="ml-auto text-2xs text-muted-foreground">
                                    ditambahkan
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="size-4" />
            Tambah komponen
          </Button>
        )}
      </div>
    </div>
  );
}
