import Link from "next/link";
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
  /** Bila diisi, kartu jadi tautan ke halaman terkait. */
  href?: string;
  /** Emphasis nilai. "lg" untuk metrik utama. */
  emphasis?: "default" | "lg";
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
  href,
  emphasis = "default",
  isLoading = false,
  className,
}: StatCardProps) {
  const card = (
    <Card
      size="sm"
      className={cn(
        "h-full gap-0",
        href &&
          "transition-colors hover:border-primary/40 hover:bg-muted/40",
        className,
      )}
    >
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-medium text-muted-foreground">
            {label}
          </span>
          {isLoading ? (
            <Skeleton
              className={cn("mt-1 w-24", emphasis === "lg" ? "h-8" : "h-7")}
            />
          ) : (
            <span
              className={cn(
                "font-heading font-semibold tracking-tight",
                emphasis === "lg" ? "text-3xl" : "text-2xl",
              )}
            >
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

  if (!href) return card;

  return (
    <Link href={href} className="group block focus-visible:outline-none">
      {card}
    </Link>
  );
}
