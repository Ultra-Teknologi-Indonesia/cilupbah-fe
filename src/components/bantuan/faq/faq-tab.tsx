"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SearchIcon, XIcon, BookOpenIcon, LinkIcon } from "lucide-react";
import { Accordion } from "radix-ui";
import { ChevronDownIcon } from "lucide-react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { FAQ_CATEGORIES, FAQ_ITEMS } from "@/lib/bantuan/faq.data";
import type { FaqCategory, FaqItem } from "@/lib/bantuan/types";
import { Markdown } from "@/components/bantuan/markdown";

export function FaqTab() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const focusId = params.get("id");

  const [query, setQuery] = React.useState("");
  const [activeCat, setActiveCat] = React.useState<FaqCategory | "all">("all");
  const [openIds, setOpenIds] = React.useState<string[]>(focusId ? [focusId] : []);

  const itemRefs = React.useRef<Map<string, HTMLDivElement | null>>(new Map());

  React.useEffect(() => {
    if (!focusId) return;
    const target = FAQ_ITEMS.find((i) => i.id === focusId);
    if (!target) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fokuskan FAQ dari URL saat mount
    setActiveCat("all");
    setQuery("");
    setOpenIds((prev) => (prev.includes(focusId) ? prev : [...prev, focusId]));

    const raf = requestAnimationFrame(() => {
      const el = itemRefs.current.get(focusId);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
    return () => cancelAnimationFrame(raf);
  }, [focusId]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      if (activeCat !== "all" && item.category !== activeCat) return false;
      if (!q) return true;
      const hay = `${item.question} ${item.answer} ${(item.tags ?? []).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, activeCat]);

  const grouped = React.useMemo(() => {
    const map = new Map<FaqCategory, FaqItem[]>();
    for (const item of filtered) {
      const bucket = map.get(item.category) ?? [];
      bucket.push(item);
      map.set(item.category, bucket);
    }
    return map;
  }, [filtered]);

  const totalCount = FAQ_ITEMS.length;

  const copyLink = async (id: string) => {
    try {
      const url = new URL(window.location.href);
      const next = new URLSearchParams(Array.from(params.entries()));
      next.set("tab", "faq");
      next.set("id", id);
      url.search = next.toString();
      await navigator.clipboard.writeText(url.toString());
      toast.success("Link FAQ disalin");
    } catch {
      toast.error("Gagal menyalin link");
    }
    const nextParams = new URLSearchParams(Array.from(params.entries()));
    nextParams.set("tab", "faq");
    nextParams.set("id", id);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-md">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pertanyaan, kata kunci..."
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
        <div className="text-xs text-muted-foreground tabular-nums">
          <span className="font-medium text-foreground">{filtered.length}</span> / {totalCount} FAQ
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={activeCat === "all" ? "default" : "outline"}
          onClick={() => setActiveCat("all")}
        >
          Semua
        </Button>
        {FAQ_CATEGORIES.map((cat) => (
          <Button
            key={cat.key}
            size="sm"
            variant={activeCat === cat.key ? "default" : "outline"}
            onClick={() => setActiveCat(cat.key)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Tidak ada FAQ yang cocok"
          description="Coba kata kunci lain, atau lihat panduan lengkap di tab Panduan Pengguna."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {FAQ_CATEGORIES.map((cat) => {
            const items = grouped.get(cat.key);
            if (!items || items.length === 0) return null;
            return (
              <section key={cat.key} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold text-foreground">{cat.label}</h2>
                  <Badge variant="outline" className="rounded-full">
                    {items.length}
                  </Badge>
                </div>
                <Card className="p-2">
                  <Accordion.Root
                    type="multiple"
                    value={openIds}
                    onValueChange={setOpenIds}
                    className="flex flex-col divide-y divide-border"
                  >
                    {items.map((item) => {
                      const isFocus = item.id === focusId;
                      return (
                        <div
                          key={item.id}
                          ref={(el) => {
                            itemRefs.current.set(item.id, el);
                          }}
                          className={cn(
                            "rounded-xl transition-shadow scroll-mt-24",
                            isFocus && "ring-2 ring-primary/40",
                          )}
                        >
                          <Accordion.Item value={item.id} className="rounded-xl">
                            <Accordion.Header className="flex">
                              <Accordion.Trigger
                                className={cn(
                                  "group flex flex-1 items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium",
                                  "hover:bg-muted/60 transition-colors rounded-xl",
                                )}
                              >
                                <span>{item.question}</span>
                                <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                              </Accordion.Trigger>
                            </Accordion.Header>
                            <Accordion.Content className="overflow-hidden data-[state=closed]:animate-none">
                              <div className="px-4 pt-1 pb-4">
                                <Markdown>{item.answer}</Markdown>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                  {item.relatedManualSlug && (
                                    <Link
                                      href={`/dashboard/bantuan?tab=panduan&slug=${encodeURIComponent(item.relatedManualSlug)}`}
                                      className="inline-flex items-center gap-1.5 text-xs text-primary underline-offset-2 hover:underline"
                                    >
                                      <BookOpenIcon className="size-3.5" />
                                      Lihat panduan lengkap
                                    </Link>
                                  )}
                                  <Button
                                    type="button"
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => copyLink(item.id)}
                                    className="ml-auto text-muted-foreground"
                                  >
                                    <LinkIcon className="size-3.5" />
                                    Salin link
                                  </Button>
                                </div>
                              </div>
                            </Accordion.Content>
                          </Accordion.Item>
                        </div>
                      );
                    })}
                  </Accordion.Root>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
