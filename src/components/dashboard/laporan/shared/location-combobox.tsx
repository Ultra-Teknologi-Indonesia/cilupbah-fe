"use client";

import * as React from "react";

import { Combobox } from "@/components/ui/combobox";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";

interface LocationComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoSelectSingle?: boolean;
}

export function LocationCombobox({
  value,
  onChange,
  placeholder = "Pilih lokasi…",
  className,
  disabled = false,
  autoSelectSingle = true,
}: LocationComboboxProps) {
  const { data, isLoading } = useLocations({ perPage: 100 });

  const options = React.useMemo(
    () =>
      (data?.items ?? [])
        .filter((l) => l.isWarehouse)
        .map((l) => ({ value: l.id, label: l.locationName })),
    [data],
  );

  React.useEffect(() => {
    if (!autoSelectSingle || isLoading || value || options.length !== 1) {
      return;
    }

    onChange(options[0].value);
  }, [autoSelectSingle, isLoading, onChange, options, value]);

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
      disabled={disabled}
    />
  );
}
