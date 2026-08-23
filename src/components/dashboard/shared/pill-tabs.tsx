"use client";

import * as React from "react";

import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface PillTabItem<T extends string = string> {
  key: T;
  label: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;

  count?: number | null;

  countLoading?: boolean;
  isFetching?: boolean;
}

export function PillTab<T extends string>({
  item,
  active,
  variant = "solid",
  isFetching,
  onSelect: _onSelect,
}: {
  item: PillTabItem<T>;
  active: boolean;
  variant?: "solid" | "soft";
  isFetching?: boolean;
  onSelect: (key: T) => void;
}) {
  const Icon = item.icon;
  const showSpinner = (active && (isFetching || item.isFetching)) ?? false;

  return (
    <TabsTrigger
      value={item.key}
      className={cn(
        "inline-flex h-auto flex-none items-center gap-1.5 rounded-full font-medium transition-all after:hidden!",
        variant === "solid" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs",
        active
          ? variant === "solid"
            ? "bg-foreground! text-background! shadow-sm!"
            : "bg-foreground/10! text-foreground!"
          : variant === "solid"
            ? "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {showSpinner ? (
        <Loader2Icon className="size-3.5 animate-spin shrink-0 text-current" />
      ) : (
        Icon && <Icon className="size-4" />
      )}
      {item.label}
      {item.countLoading ? (
        <Skeleton className="h-4 w-6 rounded-full" />
      ) : item.count != null ? (
        <span
          className={cn(
            "rounded-full px-1.5 text-xs tabular-nums transition-colors",
            active && variant === "solid"
              ? "bg-background/20 text-background"
              : "bg-background text-muted-foreground",
          )}
        >
          {item.count}
        </span>
      ) : null}
    </TabsTrigger>
  );
}

export function PillTabs<T extends string>({
  items,
  active,
  onSelect,
  variant = "solid",
  className,
}: {
  items: PillTabItem<T>[];
  active: T | null;
  onSelect: (key: T) => void;
  variant?: "solid" | "soft";
  className?: string;
}) {
  return (
    <Tabs value={active || ""} onValueChange={(val) => onSelect(val as T)}>
      <TabsList
        className={cn(
          "h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0",
          className,
        )}
      >
        {items.map((item) => (
          <PillTab
            key={item.key}
            item={item}
            active={active === item.key}
            variant={variant}
            onSelect={onSelect}
          />
        ))}
      </TabsList>
    </Tabs>
  );
}
