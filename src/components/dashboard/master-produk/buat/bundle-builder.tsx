"use client";

import * as React from "react";
import Image from "next/image";
import {
  ChevronDownIcon,
  ImageIcon,
  Loader2Icon,
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
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useInfiniteMasterProducts } from "@/hooks/master-produk/use-master-products";

export interface BundleComponentValue {
  variantId: string;
  productName: string;
  sku: string | null;
  thumbnail?: string | null;
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
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const loadMoreRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  React.useEffect(() => {
    if (open) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [open]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteMasterProducts(
    {
      search: debounced || undefined,
      perPage: 20,
    },
    { enabled: open },
  );

  const allItems = React.useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );

  const results = React.useMemo(
    () => allItems.filter((p) => !p.isBundle),
    [allItems],
  );

  // Infinite scrolling intersection observer
  React.useEffect(() => {
    if (!open || !hasNextPage || isFetchingNextPage) return;
    const el = loadMoreRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "100px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const chosen = React.useMemo(
    () => new Set(value.map((c) => c.variantId)),
    [value],
  );

  const add = (component: BundleComponentValue) => {
    if (chosen.has(component.variantId)) return;
    onChange([...value, component]);
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
    <div className="flex w-full flex-col gap-4">
      {/* Selected Components List */}
      {value.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title="Belum ada komponen bundle"
          description="Tambahkan minimal 1 produk atau varian untuk dijadikan isi bundle."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Total Komponen: <strong className="text-foreground">{value.length}</strong> produk/varian
            </span>
            <span>
              Total Qty:{" "}
              <strong className="text-foreground">
                {value.reduce((acc, curr) => acc + curr.qty, 0)}
              </strong>{" "}
              item
            </span>
          </div>

          <ul className="flex flex-col gap-2">
            {value.map((c, idx) => (
              <li
                key={c.variantId}
                className="group flex flex-col gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs transition-all hover:border-border sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {idx + 1}
                  </span>

                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/50 bg-muted/40 flex items-center justify-center">
                    {c.thumbnail ? (
                      <Image
                        unoptimized
                        src={c.thumbnail}
                        alt={c.productName}
                        width={48}
                        height={48}
                        className="size-full object-cover"
                      />
                    ) : (
                      <PackageIcon className="size-5 text-muted-foreground/60" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold leading-tight text-foreground">
                      {c.productName}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="font-mono text-primary font-medium">
                        {c.sku ?? "—"}
                      </span>
                      {(c.variationValues ?? []).map((o, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="px-1.5 py-0 text-2xs font-normal"
                        >
                          {o.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pl-9 sm:pl-0">
                  <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-background p-0.5 shadow-2xs">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-md"
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
                      className="h-7 w-12 border-0 bg-transparent p-0 text-center font-medium tabular-nums shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-7 rounded-md"
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
                    className="size-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Hapus item"
                    onClick={() => remove(c.variantId)}
                  >
                    <Trash2Icon className="size-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Component Picker / Search Section */}
      <div className="w-full">
        {open ? (
          <div className="flex flex-col rounded-2xl border border-border/80 bg-card shadow-md overflow-hidden transition-all">
            {/* Search header */}
            <div className="flex items-center gap-2.5 border-b border-border/60 bg-muted/20 px-3.5 py-3">
              <SearchIcon className="size-4.5 shrink-0 text-muted-foreground" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari berdasarkan nama produk atau SKU..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Hapus teks pencarian"
                  onClick={() => setSearch("")}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              )}
              <div className="h-4 w-px bg-border/80 mx-1" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setOpen(false);
                  setSearch("");
                }}
                className="h-8 text-xs font-medium"
              >
                Selesai
              </Button>
            </div>

            {/* Results scrollable list with infinite scroll */}
            <div className="max-h-96 min-h-[16rem] overflow-y-auto p-2 space-y-1.5 overscroll-contain">
              {isFetching && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2.5 py-12 text-center text-sm text-muted-foreground">
                  <Loader2Icon className="size-6 animate-spin text-primary" />
                  <p>Memuat daftar produk...</p>
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                  <PackageIcon className="size-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">
                    Produk tidak ditemukan
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {debounced
                      ? `Tidak ada produk yang cocok dengan kata kunci "${debounced}"`
                      : "Ketik nama produk atau SKU untuk mencari"}
                  </p>
                </div>
              ) : (
                results.map((p) => {
                  const single = p.variants.length <= 1;
                  const variant = p.variants[0];
                  const isExpanded = expanded === p.itemGroupId;
                  const isSingleChosen = single && variant && chosen.has(variant.itemId);

                  return (
                    <div
                      key={p.itemGroupId}
                      className={cn(
                        "rounded-xl border border-border/50 bg-background/50 transition-all hover:bg-muted/30",
                        isExpanded && "border-primary/30 bg-muted/20",
                      )}
                    >
                      <div className="flex items-center gap-3 p-2.5">
                        {/* Product Thumbnail */}
                        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40 flex items-center justify-center">
                          {p.thumbnail ? (
                            <Image
                              unoptimized
                              src={p.thumbnail}
                              alt={p.itemName}
                              width={44}
                              height={44}
                              className="size-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="size-5 text-muted-foreground/50" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate text-sm font-medium text-foreground">
                              {p.itemName}
                            </span>
                          </div>
                          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                            {p.categoryName && p.categoryName !== "—" && (
                              <span className="text-2xs text-muted-foreground">
                                {p.categoryName}
                              </span>
                            )}
                            {p.categoryName && p.categoryName !== "—" && (
                              <span>·</span>
                            )}
                            {single ? (
                              <span className="font-mono text-xs text-primary font-medium">
                                {variant?.sku || p.sku || "—"}
                              </span>
                            ) : (
                              <Badge
                                variant="outline"
                                className="px-1.5 py-0 text-2xs font-normal bg-background"
                              >
                                {p.variants.length} Varian
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        {single && variant ? (
                          <Button
                            type="button"
                            size="sm"
                            variant={isSingleChosen ? "secondary" : "outline"}
                            disabled={isSingleChosen}
                            onClick={() =>
                              add({
                                variantId: variant.itemId,
                                productName: p.itemName,
                                sku: variant.sku || p.sku,
                                thumbnail: variant.thumbnail ?? p.thumbnail,
                                variationValues: [],
                                qty: 1,
                              })
                            }
                            className="h-8 shrink-0 text-xs gap-1"
                          >
                            {isSingleChosen ? (
                              "Ditambahkan"
                            ) : (
                              <>
                                <PlusIcon className="size-3.5" />
                                Tambah
                              </>
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setExpanded(isExpanded ? null : p.itemGroupId)
                            }
                            className="h-8 shrink-0 text-xs gap-1 text-muted-foreground hover:text-foreground"
                          >
                            <span>Pilih Varian</span>
                            <ChevronDownIcon
                              className={cn(
                                "size-3.5 transition-transform duration-200",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </Button>
                        )}
                      </div>

                      {/* Variant Accordion Sub-list */}
                      {!single && isExpanded && (
                        <div className="border-t border-border/50 bg-muted/10 p-2 space-y-1">
                          <div className="px-2 py-1 text-2xs font-medium text-muted-foreground">
                            Pilih salah satu atau beberapa varian:
                          </div>
                          {p.variants.map((vr) => {
                            const already = chosen.has(vr.itemId);
                            const vrThumb = vr.thumbnail ?? p.thumbnail;
                            return (
                              <div
                                key={vr.itemId}
                                className={cn(
                                  "flex items-center gap-2.5 rounded-lg border border-border/40 bg-background/80 px-2.5 py-2 transition-all hover:bg-muted/40",
                                  already && "opacity-60 bg-muted/20",
                                )}
                              >
                                <div className="relative size-8 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted/40 flex items-center justify-center">
                                  {vrThumb ? (
                                    <Image
                                      unoptimized
                                      src={vrThumb}
                                      alt={vr.sku}
                                      width={32}
                                      height={32}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="size-3.5 text-muted-foreground/50" />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="font-mono text-xs font-semibold text-primary">
                                      {vr.sku}
                                    </span>
                                    {vr.variationValues.map((x, i) => (
                                      <Badge
                                        key={i}
                                        variant="secondary"
                                        className="px-1.5 py-0 text-2xs font-normal"
                                      >
                                        {x.value}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                <Button
                                  type="button"
                                  size="sm"
                                  variant={already ? "secondary" : "outline"}
                                  disabled={already}
                                  onClick={() =>
                                    add({
                                      variantId: vr.itemId,
                                      productName: p.itemName,
                                      sku: vr.sku,
                                      thumbnail: vrThumb,
                                      variationValues: vr.variationValues.map(
                                        (x) => ({ value: x.value }),
                                      ),
                                      qty: 1,
                                    })
                                  }
                                  className="h-7 text-xs px-2.5"
                                >
                                  {already ? "Ditambahkan" : "+ Tambah"}
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Sentinel trigger for infinite scroll */}
              <div ref={loadMoreRef} className="py-2 flex justify-center">
                {isFetchingNextPage ? (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                    <Loader2Icon className="size-4 animate-spin text-primary" />
                    <span>Memuat lebih banyak produk...</span>
                  </div>
                ) : hasNextPage ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchNextPage()}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Muat lebih banyak
                  </Button>
                ) : results.length > 0 ? (
                  <p className="text-2xs text-muted-foreground/70 py-1">
                    Semua produk telah ditampilkan
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed py-5 text-sm font-medium hover:border-primary hover:text-primary transition-all gap-2"
            onClick={() => setOpen(true)}
          >
            <PlusIcon className="size-4" />
            Cari & Tambah Komponen Produk
          </Button>
        )}
      </div>
    </div>
  );
}
