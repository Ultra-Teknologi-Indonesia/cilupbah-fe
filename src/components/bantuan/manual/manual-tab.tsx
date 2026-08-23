"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  SearchIcon,
  ExternalLinkIcon,
  BookOpenIcon,
  XIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { MANUAL_ENTRIES, MANUAL_GROUPS } from "@/lib/bantuan/manual.registry";
import { Markdown } from "@/components/bantuan/markdown";

export function ManualTab() {
  const params = useSearchParams();
  const activeSlug = params.get("slug") ?? MANUAL_ENTRIES[0]?.slug ?? "";

  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MANUAL_ENTRIES;
    return MANUAL_ENTRIES.filter((e) => {
      const hay =
        `${e.title} ${e.description ?? ""} ${(e.keywords ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof MANUAL_ENTRIES>();
    for (const e of filtered) {
      const bucket = map.get(e.moduleGroup) ?? [];
      bucket.push(e);
      map.set(e.moduleGroup, bucket);
    }
    return map;
  }, [filtered]);

  const active = MANUAL_ENTRIES.find((e) => e.slug === activeSlug);

  const detailHeight = "h-[calc(100dvh-260px)]";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <Card
        className={cn("flex flex-col gap-3 overflow-hidden p-4", detailHeight)}
      >
        <div className="relative shrink-0">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari panduan..."
            className="pr-9 pl-9"
          />
          {query && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
              aria-label="Hapus pencarian"
            >
              <XIcon className="size-4" />
            </Button>
          )}
        </div>

        <ScrollArea className="-mr-2 min-h-0 flex-1 pr-2">
          <nav className="flex flex-col gap-4">
            {MANUAL_GROUPS.map((group) => {
              const items = grouped.get(group);
              if (!items || items.length === 0) return null;
              return (
                <div key={group} className="flex flex-col gap-1">
                  <div className="px-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                    {group}
                  </div>
                  {items.map((item) => {
                    const isActive = item.slug === activeSlug;
                    return (
                      <Link
                        key={item.slug}
                        href={`?tab=panduan&slug=${encodeURIComponent(item.slug)}`}
                        replace
                        scroll={false}
                        className={cn(
                          "flex items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <BookOpenIcon className="mt-0.5 size-4 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                      </Link>
                    );
                  })}
                </div>
              );
            })}
            {filtered.length === 0 && (
              <div className="py-6 text-center text-xs text-muted-foreground">
                Tidak ada panduan cocok.
              </div>
            )}
          </nav>
        </ScrollArea>
      </Card>

      {active ? (
        <Card className={cn("flex flex-col overflow-hidden p-0", detailHeight)}>
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border px-6 py-5 lg:px-8">
            <div className="min-w-0 flex-1">
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {active.moduleGroup}
              </div>
              <h1 className="truncate text-2xl font-semibold tracking-tight text-balance text-foreground">
                {active.title}
              </h1>
              {active.description && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {active.description}
                </p>
              )}
              {active.keywords && active.keywords.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {active.keywords.map((k) => (
                    <Badge
                      key={k}
                      variant="outline"
                      className="rounded-full text-xs"
                    >
                      {k}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            {active.route && (
              <Button asChild size="sm" variant="outline" className="shrink-0">
                <Link href={active.route}>
                  Buka halaman <ExternalLinkIcon className="size-3.5" />
                </Link>
              </Button>
            )}
          </div>
          <ScrollArea className="min-h-0 flex-1">
            <div className="px-6 py-6 lg:px-8">
              <Markdown>
                {active.content || "_Panduan belum tersedia._"}
              </Markdown>
            </div>
          </ScrollArea>
        </Card>
      ) : (
        <Card
          className={cn("flex items-center justify-center p-8", detailHeight)}
        >
          <EmptyState
            title="Pilih panduan"
            description="Pilih panduan dari sidebar kiri untuk melihat isinya."
          />
        </Card>
      )}
    </div>
  );
}
