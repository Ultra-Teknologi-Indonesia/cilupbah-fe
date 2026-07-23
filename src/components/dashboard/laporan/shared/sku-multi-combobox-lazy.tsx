"use client";

import * as React from "react";

import { Combobox } from "@/components/ui/combobox";
import { useSkuOptionsInfinite } from "@/hooks/laporan/use-laporan-produk";
import type { LookupOption } from "@/types/common";

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
  const [rawQuery, setRawQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [cache, setCache] = React.useState<Map<string, LookupOption>>(new Map());

  React.useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useSkuOptionsInfinite(query);

  const options = React.useMemo<LookupOption[]>(
    () =>
      (data?.pages.flatMap((p) => p.data) ?? []).map((o) => ({
        value: o.id,
        label: o.name,
        hint: o.sku,
        badgeLabel: o.sku,
        imageUrl: o.image_url ?? undefined,
      })),
    [data],
  );

  const merged = React.useMemo(() => {
    const map = new Map<string, LookupOption>();
    options.forEach((o) => map.set(o.value, o));
    value.forEach((v) => {
      if (!map.has(v) && cache.has(v)) map.set(v, cache.get(v)!);
    });
    return Array.from(map.values());
  }, [options, value, cache]);

  function handleChange(next: string[]) {
    setCache((prev) => {
      let changed = false;
      const nextMap = new Map(prev);
      next.forEach((v) => {
        if (!nextMap.has(v)) {
          const opt = options.find((o) => o.value === v);
          if (opt) {
            nextMap.set(v, opt);
            changed = true;
          }
        }
      });
      return changed ? nextMap : prev;
    });
    onChange(next);
  }

  return (
    <Combobox
      multiple
      wrap
      options={merged}
      value={value}
      onChange={handleChange}
      onQueryChange={setRawQuery}
      loading={isFetching && !isFetchingNextPage}
      onLoadMore={fetchNextPage}
      hasMore={hasNextPage}
      loadingMore={isFetchingNextPage}
      placeholder="Pilih SKU…"
      searchPlaceholder="Cari SKU / nama produk…"
      emptyText="Produk tidak ditemukan."
      className={className}
    />
  );
}
