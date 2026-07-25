import * as React from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface InfoFieldProps {
  label: string;
  value?: React.ReactNode;

  icon?: LucideIcon;

  orientation?: "vertical" | "horizontal";
  className?: string;
}

function isEmpty(value: React.ReactNode) {
  return value === null || value === undefined || value === "";
}

export function InfoField({
  label,
  value,
  icon: Icon,
  orientation = "vertical",
  className,
}: InfoFieldProps) {
  const content = isEmpty(value) ? "—" : value;

  if (Icon) {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/60">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 text-xs font-medium text-muted-foreground">
            {label}
          </p>
          <div className="text-sm font-medium">{content}</div>
        </div>
      </div>
    );
  }

  if (orientation === "horizontal") {
    return (
      <div className={cn("flex items-start gap-3", className)}>
        <span className="w-36 shrink-0 text-sm text-muted-foreground">
          {label}
        </span>
        <span className="text-sm font-medium">{content}</span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="text-sm">{content}</div>
    </div>
  );
}
