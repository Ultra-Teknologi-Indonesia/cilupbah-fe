"use client";

import * as React from "react";

import { Combobox } from "@/components/ui/combobox";
import { useProductPickerSearch } from "@/hooks/laporan/use-product-picker";
import type { LookupOption } from "@/types/common";

interface ProductPickerComboboxProps {
  mode: "sku" | "sku_induk";
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
}

const DEBOUNCE_MS = 300;

export function ProductPickerCombobox({
  mode,
  value,
  onChange,
  className,
}: ProductPickerComboboxProps) {
  const [rawQuery, setRawQuery] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [selectedCache, setSelectedCache] = React.useState<
    Map<string, LookupOption>
  >(new Map());

  React.useEffect(() => {
    const t = setTimeout(() => setQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [rawQuery]);

  const { data, isFetching } = useProductPickerSearch(mode, query);
  const options = React.useMemo(() => data ?? [], [data]);

  const merged = React.useMemo(() => {
    const map = new Map<string, LookupOption>();
    options.forEach((o) => map.set(o.value, o));
    value.forEach((v) => {
      if (!map.has(v) && selectedCache.has(v)) {
        map.set(v, selectedCache.get(v)!);
      }
    });
    return Array.from(map.values());
  }, [options, value, selectedCache]);

  function handleChange(next: string[]) {
    setSelectedCache((prev) => {
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
      loading={isFetching}
      placeholder={mode === "sku" ? "Pilih SKU…" : "Pilih SKU Induk…"}
      searchPlaceholder={
        mode === "sku" ? "Cari SKU / nama produk…" : "Cari nama produk…"
      }
      emptyText="Produk tidak ditemukan."
      className={className}
    />
  );
}
