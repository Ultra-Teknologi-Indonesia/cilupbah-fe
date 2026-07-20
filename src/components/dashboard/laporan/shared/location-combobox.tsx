"use client";

import * as React from "react";

import { Combobox } from "@/components/ui/combobox";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Pemilih lokasi tunggal, untuk laporan yang memang hanya bisa satu gudang.
 * Jangan pakai LocationMultiCombobox lalu diambil pilihan terakhir — pengguna
 * bisa memilih beberapa lalu melihatnya hilang tanpa penjelasan.
 */
export function LocationCombobox({
  value,
  onChange,
  placeholder = "Pilih lokasi…",
  className,
}: LocationComboboxProps) {
  const { data, isLoading } = useLocations({ perPage: 100 });

  const options = React.useMemo(
    () =>
      (data?.items ?? [])
        .filter((l) => l.isWarehouse)
        .map((l) => ({ value: l.id, label: l.locationName })),
    [data],
  );

  return (
    <Combobox
      options={options}
      value={value}
      onChange={(v) => onChange(v ?? "")}
      loading={isLoading}
      placeholder={placeholder}
      searchPlaceholder="Cari lokasi…"
      emptyText="Lokasi tidak ditemukan."
      className={className}
    />
  );
}
