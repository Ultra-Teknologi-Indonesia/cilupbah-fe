"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchIcon, ExternalLinkIcon, BookOpenIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { MANUAL_ENTRIES, MANUAL_GROUPS } from "@/lib/bantuan/manual.registry";
import { Markdown } from "@/components/bantuan/markdown";

export function ManualTab() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const activeSlug = params.get("slug") ?? MANUAL_ENTRIES[0]?.slug ?? "";

  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MANUAL_ENTRIES;
    return MANUAL_ENTRIES.filter((e) => {
      const hay = `${e.title} ${e.description ?? ""} ${(e.keywords ?? []).join(" ")}`.toLowerCase();
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

  const selectSlug = (slug: string) => {
    const next = new URLSearchParams(Array.from(params.entries()));
    next.set("tab", "panduan");
    next.set("slug", slug);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <Card className="flex flex-col gap-3 p-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari panduan..."
            className="pl-9"
          />
        </div>

        <ScrollArea className="h-[calc(100vh-320px)] pr-2">
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
                      <button
                        key={item.slug}
                        type="button"
                        onClick={() => selectSlug(item.slug)}
                        className={cn(
                          "flex items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        <BookOpenIcon className="mt-0.5 size-4 shrink-0" />
                        <span className="flex-1">{item.title}</span>
                      </button>
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
        <Card className="p-6 lg:p-8">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 text-xs font-medium text-muted-foreground">{active.moduleGroup}</div>
              <h1 className="text-2xl font-semibold text-foreground">{active.title}</h1>
              {active.description && (
                <p className="mt-1 text-sm text-muted-foreground">{active.description}</p>
              )}
            </div>
            {active.route && (
              <Link
                href={active.route}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Buka halaman <ExternalLinkIcon className="size-3.5" />
              </Link>
            )}
          </div>
          {active.keywords && active.keywords.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {active.keywords.map((k) => (
                <Badge key={k} variant="outline" className="rounded-full text-xs">
                  {k}
                </Badge>
              ))}
            </div>
          )}
          <Markdown>{active.content || "_Panduan belum tersedia._"}</Markdown>
        </Card>
      ) : (
        <Card className="p-8">
          <EmptyState title="Pilih panduan" description="Pilih panduan dari sidebar kiri untuk melihat isinya." />
        </Card>
      )}
    </div>
  );
}
