"use client";

import { useMemo, useState } from "react";
import { Loader2Icon, StoreIcon } from "lucide-react";

import { Combobox } from "@/components/ui/combobox";
import { EmptyState } from "@/components/ui/empty-state";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";
import {
  useStockAllocationStores,
  useUpdateStockAllocation,
} from "@/hooks/channel/use-stock-allocation";
import type { StockAllocationStore, StockSourceMode } from "@/types/channel";

function StockAllocationRow({ store }: { store: StockAllocationStore }) {
  const updateMut = useUpdateStockAllocation();
  const { data: locData, isLoading: locLoading } = useLocations({
    perPage: 100,
  });

  const [mode, setMode] = useState<StockSourceMode>(store.stockSourceMode);
  const [locationId, setLocationId] = useState<string | null>(
    store.locationId,
  );
  const [synced, setSynced] = useState({
    mode: store.stockSourceMode,
    locationId: store.locationId,
  });

  // Sinkronkan state lokal saat data server berubah dari luar (mis. invalidate
  // dari halaman lain) — dilakukan saat render, bukan di useEffect, supaya
  // tidak ada commit tambahan (pola "Adjusting state when a prop changes").
  if (
    synced.mode !== store.stockSourceMode ||
    synced.locationId !== store.locationId
  ) {
    setSynced({ mode: store.stockSourceMode, locationId: store.locationId });
    setMode(store.stockSourceMode);
    setLocationId(store.locationId);
  }

  const locationOptions = useMemo(
    () =>
      (locData?.items ?? [])
        .filter((l) => l.isWarehouse)
        .map((l) => ({ value: l.id, label: l.locationName })),
    [locData],
  );

  const handleModeChange = (value: string) => {
    const next = value as StockSourceMode;
    setMode(next);

    if (next === "total") {
      updateMut.mutate({ storeId: store.storeId, stockSourceMode: "total" });
      return;
    }

    if (locationId) {
      updateMut.mutate({
        storeId: store.storeId,
        stockSourceMode: "location",
        locationId,
      });
    }
  };

  const handleLocationChange = (value: string | null) => {
    setLocationId(value);
    if (!value) return;

    updateMut.mutate({
      storeId: store.storeId,
      stockSourceMode: "location",
      locationId: value,
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <ChannelLogo
          code={store.channelName.toLowerCase()}
          name={store.channelName}
          className="size-8 rounded-xl"
        />
        <span className="truncate text-sm font-medium">
          {store.storeName}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <RadioGroup
          value={mode}
          onValueChange={handleModeChange}
          className="flex w-auto flex-row items-center gap-4"
        >
          <label
            htmlFor={`total-${store.storeId}`}
            className="flex cursor-pointer items-center gap-1.5 text-sm"
          >
            <RadioGroupItem id={`total-${store.storeId}`} value="total" />
            Stok Total
          </label>
          <label
            htmlFor={`location-${store.storeId}`}
            className="flex cursor-pointer items-center gap-1.5 text-sm"
          >
            <RadioGroupItem id={`location-${store.storeId}`} value="location" />
            Lokasi Stok
          </label>
        </RadioGroup>

        {mode === "location" && (
          <Combobox
            options={locationOptions}
            value={locationId}
            onChange={handleLocationChange}
            placeholder="Pilih gudang…"
            searchPlaceholder="Cari gudang…"
            loading={locLoading}
            className="w-56"
          />
        )}

        {updateMut.isPending && (
          <Loader2Icon className="size-4 shrink-0 animate-spin text-muted-foreground" />
        )}
      </div>
    </div>
  );
}

export function StockAllocationList() {
  const { data: stores, isLoading } = useStockAllocationStores();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2Icon className="size-5 animate-spin" />
      </div>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <EmptyState
        icon={StoreIcon}
        title="Belum ada toko terhubung"
        description="Hubungkan toko marketplace dulu di halaman Integrasi Channel."
      />
    );
  }

  return (
    <LiquidGlass
      radius={16}
      intensity="subtle"
      className="bg-white/40 dark:bg-white/[0.06]"
    >
      <div className="flex flex-col divide-y divide-border/60 px-5 py-2">
        {stores.map((store) => (
          <StockAllocationRow key={store.storeId} store={store} />
        ))}
      </div>
    </LiquidGlass>
  );
}
