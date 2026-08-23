"use client";

import * as React from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  SearchIcon,
  XIcon,
  CornerDownLeftIcon,
  Loader2Icon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS, FAQ_CATEGORIES } from "@/lib/bantuan/faq.data";
import { MANUAL_ENTRIES } from "@/lib/bantuan/manual.registry";
import type { ApiDocIndex } from "@/lib/bantuan/types";

type Hit =
  | {
      kind: "faq";
      id: string;
      category: string;
      question: string;
      answer: string;
    }
  | {
      kind: "panduan";
      slug: string;
      moduleGroup: string;
      title: string;
      description?: string;
    }
  | {
      kind: "api-module";
      slug: string;
      name: string;
      description: string;
      endpointsCount: number;
    };

const MAX_PER_GROUP = 5;
const INDEX_URL = "/bantuan/index.json";

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "");
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const q = normalize(query);
  const source = text;
  const lower = normalize(text);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  let idx = lower.indexOf(q, cursor);
  let key = 0;
  while (idx !== -1) {
    if (idx > cursor) parts.push(source.slice(cursor, idx));
    parts.push(
      <mark
        key={`h${key++}`}
        className="rounded bg-accent-soft px-0.5 text-accent-ink"
        style={{
          background: "color-mix(in oklch, var(--primary) 22%, transparent)",
          color: "var(--primary)",
        }}
      >
        {source.slice(idx, idx + q.length)}
      </mark>,
    );
    cursor = idx + q.length;
    idx = lower.indexOf(q, cursor);
  }
  if (cursor < source.length) parts.push(source.slice(cursor));
  return parts;
}

function faqCategoryLabel(key: string): string {
  return FAQ_CATEGORIES.find((c) => c.key === key)?.label ?? key;
}

export function GlobalHelpSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [apiIndex, setApiIndex] = React.useState<ApiDocIndex | null>(null);
  const [apiLoading, setApiLoading] = React.useState(false);

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const loadApiIndex = React.useCallback(() => {
    if (apiIndex || apiLoading) return;
    setApiLoading(true);
    fetch(INDEX_URL, { cache: "force-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ApiDocIndex | null) => setApiIndex(d))
      .catch(() => setApiIndex(null))
      .finally(() => setApiLoading(false));
  }, [apiIndex, apiLoading]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const hits = React.useMemo<{ faq: Hit[]; panduan: Hit[]; api: Hit[] }>(() => {
    const q = normalize(query.trim());
    if (q.length < 2) return { faq: [], panduan: [], api: [] };

    const faq = FAQ_ITEMS.filter((item) => {
      const hay = normalize(
        `${item.question} ${item.answer} ${(item.tags ?? []).join(" ")} ${faqCategoryLabel(item.category)}`,
      );
      return hay.includes(q);
    })
      .slice(0, MAX_PER_GROUP)
      .map<Hit>((f) => ({
        kind: "faq",
        id: f.id,
        category: f.category,
        question: f.question,
        answer: f.answer,
      }));

    const panduan = MANUAL_ENTRIES.filter((e) => {
      const hay = normalize(
        `${e.title} ${e.description ?? ""} ${(e.keywords ?? []).join(" ")} ${e.moduleGroup}`,
      );
      return hay.includes(q);
    })
      .slice(0, MAX_PER_GROUP)
      .map<Hit>((e) => ({
        kind: "panduan",
        slug: e.slug,
        moduleGroup: e.moduleGroup,
        title: e.title,
        description: e.description,
      }));

    const api = (apiIndex?.modules ?? [])
      .filter((m) => {
        const hay = normalize(`${m.name} ${m.slug} ${m.description}`);
        return hay.includes(q);
      })
      .slice(0, MAX_PER_GROUP)
      .map<Hit>((m) => ({
        kind: "api-module",
        slug: m.slug,
        name: m.name,
        description: m.description,
        endpointsCount: m.endpoints_count,
      }));

    return { faq, panduan, api };
  }, [query, apiIndex]);

  const flat = React.useMemo(
    () => [...hits.faq, ...hits.panduan, ...hits.api],
    [hits],
  );
  const totalHits = flat.length;

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset highlight saat query berubah
    setActiveIdx(0);
  }, [query]);

  const goTo = React.useCallback(
    (hit: Hit) => {
      const next = new URLSearchParams(Array.from(params.entries()));
      if (hit.kind === "faq") {
        next.set("tab", "faq");
        next.set("id", hit.id);
        next.delete("slug");
      } else if (hit.kind === "panduan") {
        next.set("tab", "panduan");
        next.set("slug", hit.slug);
        next.delete("id");
      } else {
        next.set("tab", "api");
        next.set("module", hit.slug);
        next.delete("id");
        next.delete("slug");
      }
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
      setOpen(false);
      setQuery("");
      inputRef.current?.blur();
    },
    [params, pathname, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      if (query) {
        setQuery("");
      } else {
        setOpen(false);
        inputRef.current?.blur();
      }
      return;
    }
    if (!open || totalHits === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % totalHits);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + totalHits) % totalHits);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = flat[activeIdx];
      if (hit) goTo(hit);
    }
  };

  const showDropdown = open && query.trim().length >= 2;

  return (
    <div ref={wrapRef} className="relative w-full max-w-2xl">
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={query}
          placeholder="Cari FAQ, panduan, atau endpoint API…"
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            loadApiIndex();
          }}
          onKeyDown={onKeyDown}
          className="h-11 rounded-full pr-24 pl-10 text-sm"
          aria-expanded={showDropdown}
          aria-controls="global-help-search-listbox"
          role="combobox"
          autoComplete="off"
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
          {query && (
            <Button
              type="button"
              size="icon-xs"
              variant="ghost"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              aria-label="Hapus pencarian"
              className="text-muted-foreground"
            >
              <XIcon className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {showDropdown && (
        <div
          id="global-help-search-listbox"
          role="listbox"
          className="absolute top-full right-0 left-0 z-40 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-background p-1.5 shadow-lg"
        >
          {totalHits === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
              {apiLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2Icon className="size-3.5 animate-spin" /> Mengindeks
                  endpoint API…
                </span>
              ) : (
                <>
                  Tidak ada hasil untuk{" "}
                  <span className="font-medium text-foreground">
                    &quot;{query}&quot;
                  </span>
                </>
              )}
            </div>
          ) : (
            <>
              {hits.faq.length > 0 && (
                <ResultGroup label="FAQ" count={hits.faq.length}>
                  {hits.faq.map((h, i) => (
                    <ResultRow
                      key={`faq-${h.kind === "faq" ? h.id : ""}`}
                      active={activeIdx === i}
                      onSelect={() => goTo(h)}
                      onHover={() => setActiveIdx(i)}
                    >
                      <FaqRowInner
                        hit={h as Extract<Hit, { kind: "faq" }>}
                        query={query}
                      />
                    </ResultRow>
                  ))}
                </ResultGroup>
              )}
              {hits.panduan.length > 0 && (
                <ResultGroup label="Panduan" count={hits.panduan.length}>
                  {hits.panduan.map((h, i) => {
                    const idx = hits.faq.length + i;
                    return (
                      <ResultRow
                        key={`panduan-${h.kind === "panduan" ? h.slug : ""}`}
                        active={activeIdx === idx}
                        onSelect={() => goTo(h)}
                        onHover={() => setActiveIdx(idx)}
                      >
                        <PanduanRowInner
                          hit={h as Extract<Hit, { kind: "panduan" }>}
                          query={query}
                        />
                      </ResultRow>
                    );
                  })}
                </ResultGroup>
              )}
              {hits.api.length > 0 && (
                <ResultGroup label="Dokumentasi API" count={hits.api.length}>
                  {hits.api.map((h, i) => {
                    const idx = hits.faq.length + hits.panduan.length + i;
                    return (
                      <ResultRow
                        key={`api-${h.kind === "api-module" ? h.slug : ""}`}
                        active={activeIdx === idx}
                        onSelect={() => goTo(h)}
                        onHover={() => setActiveIdx(idx)}
                      >
                        <ApiRowInner
                          hit={h as Extract<Hit, { kind: "api-module" }>}
                          query={query}
                        />
                      </ResultRow>
                    );
                  })}
                </ResultGroup>
              )}
            </>
          )}
          <div className="mt-1 flex items-center justify-between border-t border-border px-3 pt-2 pb-1 text-[10px] tracking-wide text-muted-foreground uppercase">
            <span className="inline-flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1 font-mono text-[10px]">
                ↑↓
              </kbd>
              <span>navigasi</span>
              <kbd className="ml-2 rounded border border-border bg-muted px-1 font-mono text-[10px]">
                ↵
              </kbd>
              <span>buka</span>
              <kbd className="ml-2 rounded border border-border bg-muted px-1 font-mono text-[10px]">
                esc
              </kbd>
              <span>tutup</span>
            </span>
            <span className="tabular-nums normal-case tracking-normal">
              {totalHits} hasil
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultGroup({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <div className="flex items-center justify-between px-3 pt-1.5 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
        <span>{label}</span>
        <span className="tabular-nums normal-case">{count}</span>
      </div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function ResultRow({
  active,
  onSelect,
  onHover,
  children,
}: {
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onSelect}
      onMouseEnter={onHover}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left transition-colors",
        active ? "bg-muted" : "hover:bg-muted/60",
      )}
    >
      {children}
      {active && (
        <CornerDownLeftIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
      )}
    </button>
  );
}

function FaqRowInner({
  hit,
  query,
}: {
  hit: Extract<Hit, { kind: "faq" }>;
  query: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-0.5 flex items-center gap-2">
        <Badge variant="outline" className="rounded-full text-[10px]">
          {faqCategoryLabel(hit.category)}
        </Badge>
      </div>
      <div className="line-clamp-1 text-sm font-medium text-foreground">
        {highlight(hit.question, query)}
      </div>
      <div className="line-clamp-1 text-xs text-muted-foreground">
        {highlight(hit.answer.replace(/[#*`]/g, "").trim(), query)}
      </div>
    </div>
  );
}

function PanduanRowInner({
  hit,
  query,
}: {
  hit: Extract<Hit, { kind: "panduan" }>;
  query: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-0.5 text-[10px] tracking-wide text-muted-foreground uppercase">
        {hit.moduleGroup}
      </div>
      <div className="line-clamp-1 text-sm font-medium text-foreground">
        {highlight(hit.title, query)}
      </div>
      {hit.description && (
        <div className="line-clamp-1 text-xs text-muted-foreground">
          {highlight(hit.description, query)}
        </div>
      )}
    </div>
  );
}

function ApiRowInner({
  hit,
  query,
}: {
  hit: Extract<Hit, { kind: "api-module" }>;
  query: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-0.5 flex items-center gap-2">
        <Badge variant="outline" className="rounded-full text-[10px]">
          Modul
        </Badge>
        <span className="font-mono text-[10px] text-muted-foreground">
          {hit.endpointsCount} endpoint
        </span>
      </div>
      <div className="line-clamp-1 text-sm font-medium text-foreground">
        {highlight(hit.name, query)}
      </div>
      <div className="line-clamp-1 text-xs text-muted-foreground">
        {highlight(hit.description || `Modul ${hit.slug}`, query)}
      </div>
    </div>
  );
}
