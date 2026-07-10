import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  /** Semantic accent for the icon tile. Defaults to neutral. */
  tone?: "default" | "success" | "warning" | "destructive";
  isLoading?: boolean;
  className?: string;
}

const TONE_STYLES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "default",
  isLoading = false,
  className,
}: StatCardProps) {
  return (
    <Card size="sm" className={cn("gap-0", className)}>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-medium text-muted-foreground">
            {label}
          </span>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-24" />
          ) : (
            <span className="font-heading text-2xl font-semibold tracking-tight">
              {value}
            </span>
          )}
          {hint ? (
            <span className="truncate text-xs text-muted-foreground">
              {hint}
            </span>
          ) : null}
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              TONE_STYLES[tone],
            )}
          >
            <Icon className="size-4.5" />
          </span>
        ) : null}
      </CardContent>
    </Card>
  );
}
