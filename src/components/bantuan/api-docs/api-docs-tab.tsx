"use client";

import * as React from "react";
import { SearchIcon, DownloadIcon, Loader2, InfoIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

import { CopyJsonButton } from "@/components/bantuan/copy-json-button";
import { MethodBadge } from "./method-badge";
import { EndpointDetail } from "./endpoint-detail";
import type { ApiDocIndex, ApiDocModule, ApiDocEndpoint } from "@/lib/bantuan/types";

const INDEX_URL = "/bantuan/index.json";
const MODULE_URL = (slug: string) => `/bantuan/modules/${slug}.json`;

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url, { cache: "force-cache" });
  if (!r.ok) throw new Error(`Fetch ${url}: ${r.status}`);
  return r.json();
}

export function ApiDocsTab() {
  const [index, setIndex] = React.useState<ApiDocIndex | null>(null);
  const [indexErr, setIndexErr] = React.useState<string | null>(null);
  const [activeModuleSlug, setActiveModuleSlug] = React.useState<string | null>(null);
  const [activeModule, setActiveModule] = React.useState<ApiDocModule | null>(null);
  const [activeEndpointId, setActiveEndpointId] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState<string>("ALL");

  const moduleLoading = activeModuleSlug !== null && activeModule?.slug !== activeModuleSlug;

  // Load index
  React.useEffect(() => {
    fetchJson<ApiDocIndex>(INDEX_URL)
      .then((d) => {
        setIndex(d);
        if (d.modules[0]) setActiveModuleSlug(d.modules[0].slug);
      })
      .catch((e) => setIndexErr(String(e)));
  }, []);

  // Load module on selection
  React.useEffect(() => {
    if (!activeModuleSlug) return;
    let cancelled = false;
    fetchJson<ApiDocModule>(MODULE_URL(activeModuleSlug))
      .then((m) => {
        if (cancelled) return;
        setActiveModule(m);
        setActiveEndpointId(m.endpoints[0]?.id ?? null);
      })
      .catch(() => {
        if (!cancelled) setActiveModule(null);
      });
    return () => {
      cancelled = true;
    };
  }, [activeModuleSlug]);

  const filteredEndpoints = React.useMemo<ApiDocEndpoint[]>(() => {
    if (!activeModule) return [];
    const q = query.trim().toLowerCase();
    return activeModule.endpoints.filter((e) => {
      if (methodFilter !== "ALL" && e.method !== methodFilter) return false;
      if (!q) return true;
      return (
        e.path.toLowerCase().includes(q) ||
        e.summary.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q) ||
        (e.action ?? "").toLowerCase().includes(q)
      );
    });
  }, [activeModule, query, methodFilter]);

  const activeEndpoint = activeModule?.endpoints.find((e) => e.id === activeEndpointId) ?? null;

  if (indexErr) {
    return (
      <Card className="p-8">
        <EmptyState
          title="Gagal memuat dokumentasi API"
          description={`Pastikan file /bantuan/index.json ada. Generate dengan: php artisan bantuan:export-docs --fe. Error: ${indexErr}`}
        />
      </Card>
    );
  }

  if (!index) {
    return (
      <Card className="flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Modul</div>
            <div className="font-semibold">{index.totals.modules}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Total endpoint</div>
            <div className="font-semibold">{index.totals.endpoints}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Belum ber-PHPDoc</div>
            <div className="font-semibold text-warning">{index.totals.undocumented}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Digenerate</div>
            <div className="font-mono text-xs">{new Date(index.generated_at).toLocaleString("id-ID")}</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={INDEX_URL}
            download="api-docs-index.json"
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted"
          >
            <DownloadIcon className="size-3.5" /> Download index.json
          </a>
          {activeModule && (
            <CopyJsonButton
              data={activeModule}
              label={`Copy JSON modul ${activeModule.name}`}
              successMessage={`Modul ${activeModule.name} disalin`}
            />
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_320px_1fr]">
        {/* Column 1: Module list */}
        <Card className="flex flex-col gap-2 p-3">
          <div className="px-2 pt-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Modul BE
          </div>
          <ScrollArea className="h-[calc(100vh-360px)] pr-1">
            <div className="flex flex-col gap-1">
              {index.modules.map((m) => {
                const active = m.slug === activeModuleSlug;
                return (
                  <button
                    key={m.slug}
                    type="button"
                    onClick={() => setActiveModuleSlug(m.slug)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      active ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted",
                    )}
                  >
                    <span>{m.name}</span>
                    <Badge variant="outline" className="rounded-full text-[10px]">
                      {m.endpoints_count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </Card>

        {/* Column 2: Endpoint list */}
        <Card className="flex flex-col gap-2 p-3">
          <div className="flex flex-col gap-2 px-1">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari path/summary..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {["ALL", "GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={methodFilter === m ? "default" : "outline"}
                  onClick={() => setMethodFilter(m)}
                  className="h-7 px-2 text-[10px] font-mono"
                >
                  {m}
                </Button>
              ))}
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-440px)] pr-1">
            {moduleLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredEndpoints.length === 0 ? (
              <div className="py-10 text-center text-xs text-muted-foreground">
                Tidak ada endpoint cocok.
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {filteredEndpoints.map((e) => {
                  const active = e.id === activeEndpointId;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setActiveEndpointId(e.id)}
                      className={cn(
                        "flex flex-col gap-1 rounded-xl px-3 py-2 text-left transition-colors",
                        active ? "bg-primary/10" : "hover:bg-muted",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <MethodBadge method={e.method} />
                        {e.needs_doc && (
                          <span title="PHPDoc belum ditulis">
                            <InfoIcon className="size-3 text-warning" />
                          </span>
                        )}
                      </div>
                      <code className={cn("text-xs font-mono truncate", active ? "text-primary" : "text-foreground")}>
                        {e.path}
                      </code>
                      {e.summary && (
                        <span className="text-[11px] text-muted-foreground truncate">{e.summary}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        {/* Column 3: Endpoint detail */}
        <div>
          {activeEndpoint ? (
            <EndpointDetail endpoint={activeEndpoint} />
          ) : (
            <Card className="p-8">
              <EmptyState title="Pilih endpoint" description="Pilih endpoint dari kolom kiri." />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
