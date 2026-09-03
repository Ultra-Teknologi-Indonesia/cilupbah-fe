"use client";

import * as React from "react";

import { Combobox } from "@/components/ui/combobox";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";

interface LocationMultiComboboxProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
}

export function LocationMultiCombobox({
  value,
  onChange,
  className,
  disabled = false,
}: LocationMultiComboboxProps) {
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
      multiple
      wrap
      options={options}
      value={value}
      onChange={onChange}
      loading={isLoading}
      placeholder="Semua lokasi"
      searchPlaceholder="Cari lokasi…"
      emptyText="Lokasi tidak ditemukan."
      className={className}
      disabled={disabled}
    />
  );
}
