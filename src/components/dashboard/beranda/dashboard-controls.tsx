"use client";

import { CalendarIcon, ChevronDownIcon, MapPinIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocations } from "@/hooks/manajemen-rak/use-locations";

export const PERIOD_OPTIONS = [
  { value: "7", label: "7 hari" },
  { value: "30", label: "30 hari" },
  { value: "90", label: "90 hari" },
] as const;

export type PeriodValue = (typeof PERIOD_OPTIONS)[number]["value"];

interface DashboardControlsProps {
  period: PeriodValue;
  onPeriodChange: (value: PeriodValue) => void;
  locationId: string;
  onLocationChange: (value: string) => void;
}

export function DashboardControls({
  period,
  onPeriodChange,
  locationId,
  onLocationChange,
}: DashboardControlsProps) {
  const { data: locData } = useLocations({ perPage: 100 });
  const locations = locData?.items ?? [];

  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "30 hari";
  const locationLabel =
    locations.find((l) => l.id === locationId)?.locationName ?? "Semua lokasi";

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            <CalendarIcon className="size-4 text-muted-foreground" />
            {periodLabel}
            <ChevronDownIcon className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuLabel>Periode</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={period}
            onValueChange={(v) => onPeriodChange(v as PeriodValue)}
          >
            {PERIOD_OPTIONS.map((opt) => (
              <DropdownMenuRadioItem key={opt.value} value={opt.value}>
                {opt.label} terakhir
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="max-w-52 gap-1.5">
            <MapPinIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{locationLabel}</span>
            <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 min-w-52">
          <DropdownMenuLabel>Lokasi</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={locationId}
            onValueChange={onLocationChange}
          >
            <DropdownMenuRadioItem value="">Semua lokasi</DropdownMenuRadioItem>
            {locations.map((loc) => (
              <DropdownMenuRadioItem key={loc.id} value={loc.id}>
                {loc.locationName}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
