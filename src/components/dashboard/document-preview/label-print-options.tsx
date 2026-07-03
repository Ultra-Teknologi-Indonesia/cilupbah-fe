"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePrintLabelCapabilities } from "@/hooks/channel/use-print-label-capabilities";
import type { PrintCapabilityOption } from "@/types/channel";

function OptSelect({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: PrintCapabilityOption[];
  ariaLabel: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        size="sm"
        className="h-8 w-auto min-w-28"
        aria-label={ariaLabel}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function defaultValue(options: PrintCapabilityOption[]): string {
  return options.find((o) => o.default)?.value ?? options[0]?.value ?? "";
}

export function LabelPrintOptions({ source }: { source?: string | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const channel = (source ?? "").toLowerCase();
  const { data: caps, isLoading } = usePrintLabelCapabilities(channel);

  const setParam = (key: string, val: string) => {
    const next = new URLSearchParams(sp.toString());
    if (val) next.set(key, val);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`);
  };

  if (!channel) return null;

  if (isLoading) {
    return (
      <div className="hidden items-center gap-1.5 md:flex">
        <Skeleton className="h-8 w-28 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-md" />
      </div>
    );
  }

  const types = caps?.document_types ?? [];
  const sizes = caps?.document_sizes ?? [];

  if (types.length === 0 && sizes.length === 0) return null;

  return (
    <div className="hidden items-center gap-1.5 md:flex">
      {types.length > 0 && (
        <OptSelect
          ariaLabel="Jenis dokumen"
          value={sp.get("document_type") ?? defaultValue(types)}
          onChange={(v) => setParam("document_type", v)}
          options={types}
        />
      )}
      {sizes.length > 0 && (
        <OptSelect
          ariaLabel="Ukuran kertas"
          value={sp.get("document_size") ?? defaultValue(sizes)}
          onChange={(v) => setParam("document_size", v)}
          options={sizes}
        />
      )}
    </div>
  );
}
