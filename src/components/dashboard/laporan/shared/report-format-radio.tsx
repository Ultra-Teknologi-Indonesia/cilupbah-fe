"use client";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type ReportFormat = "pdf" | "excel";

const FORMAT_OPTIONS: { value: ReportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "excel", label: "Excel" },
];

interface ReportFormatRadioProps {
  value: ReportFormat;
  onChange: (value: ReportFormat) => void;
}

export function ReportFormatRadio({ value, onChange }: ReportFormatRadioProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs text-muted-foreground">Format</Label>
      <RadioGroup
        value={value}
        onValueChange={(v) => onChange(v as ReportFormat)}
        className="grid grid-cols-2 gap-2"
      >
        {FORMAT_OPTIONS.map((o) => (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-colors",
              value === o.value
                ? "border-primary bg-primary/10 font-medium text-primary"
                : "border-border hover:bg-muted/50",
            )}
          >
            <RadioGroupItem value={o.value} />
            {o.label}
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
