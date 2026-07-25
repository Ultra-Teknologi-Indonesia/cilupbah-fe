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

  tone?: "default" | "success" | "warning" | "destructive";

  href?: string;

  emphasis?: "default" | "lg" | "hero";
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
  const isHero = emphasis === "hero";

  const card = (
    <Card
      size="sm"
      className={cn(
        "h-full justify-center gap-0",
        isHero && "[--card-spacing:--spacing(5)]",
        href && "transition-colors hover:border-primary/40 hover:bg-muted/40",
        className,
      )}
    >
      <CardContent className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <span
            className={cn(
              "truncate font-medium text-muted-foreground",
              isHero
                ? "text-2xs font-semibold tracking-wide uppercase"
                : "text-sm",
            )}
          >
            {label}
          </span>
          {isLoading ? (
            <Skeleton
              className={cn(
                "mt-1 w-28",
                isHero ? "h-10" : emphasis === "lg" ? "h-8" : "h-7",
              )}
            />
          ) : (
            <span
              className={cn(
                "font-heading font-semibold tabular-nums tracking-tight",
                isHero
                  ? "mt-0.5 text-4xl"
                  : emphasis === "lg"
                    ? "text-3xl"
                    : "text-2xl",
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
              "flex shrink-0 items-center justify-center rounded-xl",
              isHero ? "size-11" : "size-9",
              TONE_STYLES[tone],
            )}
          >
            <Icon className={isHero ? "size-5.5" : "size-4.5"} />
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
