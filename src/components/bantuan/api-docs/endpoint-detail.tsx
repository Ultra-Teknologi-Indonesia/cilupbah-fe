"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLinkIcon, ShieldIcon, ZapIcon, AlertTriangleIcon, InfoIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CopyJsonButton } from "@/components/bantuan/copy-json-button";
import { cn } from "@/lib/utils";
import { MethodBadge } from "./method-badge";
import { JsonBlock } from "./json-block";
import type { ApiDocEndpoint } from "@/lib/bantuan/types";

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-4 first:border-none first:pt-0">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

export function EndpointDetail({
  endpoint,
  className,
}: {
  endpoint: ApiDocEndpoint;
  className?: string;
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden p-0", className)}>

      <div className="flex shrink-0 flex-col gap-3 border-b border-border px-6 py-5">
        <div className="flex flex-wrap items-center gap-2">
          <MethodBadge method={endpoint.method} />
          <code className="rounded-xl bg-muted px-2 py-1 font-mono text-xs">{endpoint.path}</code>
          {endpoint.deprecated && (
            <Badge variant="destructive" className="rounded-full">Deprecated</Badge>
          )}
          {endpoint.needs_doc && (
            <Badge variant="outline" className="rounded-full border-warning/40 text-warning">
              PHPDoc belum ditulis
            </Badge>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-semibold tracking-tight text-balance text-foreground">{endpoint.summary || endpoint.id}</h2>
            {endpoint.description && (
              <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">{endpoint.description}</p>
            )}
          </div>
          <CopyJsonButton data={endpoint} label="Salin JSON" successMessage="JSON endpoint disalin" />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex flex-col gap-5 px-6 py-6">

          <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/50 p-3 text-xs tabular-nums sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-muted-foreground">Modul</div>
              <div className="font-medium text-foreground">{endpoint.module_name}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Auth</div>
              <div className="font-mono text-foreground">{endpoint.auth}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Rate Limit</div>
              <div className="font-mono text-foreground">{endpoint.rate_limit ?? "60/menit"}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Route Name</div>
              <div className="truncate font-mono text-foreground" title={endpoint.id}>{endpoint.id}</div>
            </div>
          </div>

          {endpoint.purpose && (
            <Section title="Untuk apa" icon={<InfoIcon className="size-4 text-primary" />}>
              <p className="text-sm text-foreground">{endpoint.purpose}</p>
            </Section>
          )}

          {endpoint.roles.length > 0 && (
            <Section title="Peran / Permission" icon={<ShieldIcon className="size-4 text-primary" />}>
              <div className="flex flex-wrap gap-1.5">
                {endpoint.roles.map((r) => (
                  <Badge key={r} variant="outline" className="rounded-full font-mono text-xs">
                    {r}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {endpoint.path_params.length > 0 && (
            <Section title="Path Parameters">
              <ul className="flex flex-col gap-2 text-sm">
                {endpoint.path_params.map((p) => (
                  <li key={p.name} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{p.name}</code>
                      <span className="text-xs text-muted-foreground">{p.type}</span>
                      {p.required && <Badge variant="outline" className="rounded-full text-[10px]">wajib</Badge>}
                    </div>
                    {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {endpoint.allowed_filters && endpoint.allowed_filters.length > 0 && (
            <Section title="Filter yang Diizinkan (Spatie QueryBuilder)">
              <Table containerClassName="rounded-xl border border-border" className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9">Nama</TableHead>
                    <TableHead className="h-9">Tipe</TableHead>
                    <TableHead className="h-9">Kolom / Scope</TableHead>
                    <TableHead className="h-9">Contoh Pemakaian</TableHead>
                    <TableHead className="h-9">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {endpoint.allowed_filters.map((f) => (
                    <TableRow key={f.name} className="align-top">
                      <TableCell className="py-2 font-mono">{f.name}</TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className="rounded-full text-[10px]">{f.type}</Badge>
                      </TableCell>
                      <TableCell className="py-2 font-mono text-muted-foreground">{f.column || f.scope || "—"}</TableCell>
                      <TableCell className="py-2 font-mono">{f.usage_example ?? `?filter[${f.name}]=value`}</TableCell>
                      <TableCell className="py-2 whitespace-normal">
                        <div>{f.description}</div>
                        {f.enum && f.enum.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            <span className="text-[10px] text-muted-foreground">Nilai valid:</span>
                            {f.enum.map((v) => (
                              <code key={v} className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">{v}</code>
                            ))}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          )}

          {endpoint.allowed_search && endpoint.allowed_search.length > 0 && (
            <Section title="Kolom Search yang Diizinkan">
              <p className="mb-2 text-xs text-muted-foreground">
                Kirim <code className="rounded bg-muted px-1 py-0.5 font-mono">?search=keyword</code> — cari (LIKE) di kolom berikut:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {endpoint.allowed_search.map((c) => (
                  <Badge key={c} variant="outline" className="rounded-full font-mono text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {endpoint.allowed_sorts && endpoint.allowed_sorts.length > 0 && (
            <Section title="Kolom Sort yang Diizinkan">
              <p className="mb-2 text-xs text-muted-foreground">
                Kirim <code className="rounded bg-muted px-1 py-0.5 font-mono">?sort=nama_kolom</code> (asc) atau <code className="rounded bg-muted px-1 py-0.5 font-mono">?sort=-nama_kolom</code> (desc)
                {endpoint.default_sort && (
                  <>. Default: <code className="rounded bg-muted px-1 py-0.5 font-mono">{endpoint.default_sort}</code></>
                )}.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {endpoint.allowed_sorts.map((c) => (
                  <Badge key={c} variant="outline" className="rounded-full font-mono text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {endpoint.allowed_includes && endpoint.allowed_includes.length > 0 && (
            <Section title="Relasi yang Bisa Di-include">
              <p className="mb-2 text-xs text-muted-foreground">
                Kirim <code className="rounded bg-muted px-1 py-0.5 font-mono">?include=nama_relasi</code> untuk eager-load:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {endpoint.allowed_includes.map((c) => (
                  <Badge key={c} variant="outline" className="rounded-full font-mono text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {endpoint.allowed_fields && endpoint.allowed_fields.length > 0 && (
            <Section title="Sparse Fields yang Diizinkan">
              <p className="mb-2 text-xs text-muted-foreground">
                Kirim <code className="rounded bg-muted px-1 py-0.5 font-mono">?fields[tabel]=kolom1,kolom2</code> untuk pilih kolom saja:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {endpoint.allowed_fields.map((c) => (
                  <Badge key={c} variant="outline" className="rounded-full font-mono text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {endpoint.query_params.length > 0 && (
            <Section title="Query Parameters">
              <ul className="flex flex-col gap-1 text-sm">
                {endpoint.query_params.map((p) => (
                  <li key={p.name} className="flex items-start gap-2">
                    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{p.name}</code>
                    <span className="text-xs text-muted-foreground">{p.type}</span>
                    <span className="text-xs text-foreground">{p.description}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {Object.keys(endpoint.body_schema).length > 0 && (
            <Section title="Body Schema (dari FormRequest)">
              <Table containerClassName="rounded-xl border border-border" className="text-xs">
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-9">Field</TableHead>
                    <TableHead className="h-9">Tipe</TableHead>
                    <TableHead className="h-9">Wajib</TableHead>
                    <TableHead className="h-9">Aturan / Constraint</TableHead>
                    <TableHead className="h-9">Keterangan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(endpoint.body_schema).map(([field, spec]) => (
                    <TableRow key={field} className="align-top">
                      <TableCell className="py-2 font-mono">{field}</TableCell>
                      <TableCell className="py-2">{spec.type}</TableCell>
                      <TableCell className="py-2">
                        {spec.required ? (
                          <Badge variant="destructive" className="rounded-full text-[10px]">wajib</Badge>
                        ) : (
                          <span className="text-muted-foreground">opsional</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2 font-mono whitespace-normal">
                        {spec.rules.join(" | ")}
                        {spec.enum && spec.enum.length > 0 && (
                          <div className="mt-1 text-primary">enum: {spec.enum.join(", ")}</div>
                        )}
                        {spec.exists && <div className="mt-1 text-muted-foreground">exists: {spec.exists}</div>}
                      </TableCell>
                      <TableCell className="py-2 whitespace-normal text-muted-foreground">{spec.description ?? "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Section>
          )}

          {endpoint.validation.length > 0 && (
            <Section title="Validation Rules (flat)">
              <JsonBlock data={endpoint.validation} />
            </Section>
          )}

          {Object.keys(endpoint.body_example).length > 0 && (
            <Section title="Body Example (contoh valid)">
              <JsonBlock data={endpoint.body_example} />
            </Section>
          )}

          <Section title="Response Sukses">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <JsonBlock label="Schema" data={endpoint.response_success_schema} />
              <JsonBlock label="Example" data={endpoint.response_success_example} />
            </div>
          </Section>

          {endpoint.response_errors.length > 0 && (
            <Section title="Response Error" icon={<AlertTriangleIcon className="size-4 text-destructive" />}>
              <div className="flex flex-col gap-3">
                {endpoint.response_errors.map((err, idx) => (
                  <div key={`${err.status}-${idx}`} className="rounded-xl border border-border p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full font-mono text-xs">
                        {err.status}
                      </Badge>
                      <span className="text-sm font-medium text-foreground">{err.reason}</span>
                    </div>
                    {err.terjemahan && (
                      <p className="mb-2 text-xs text-muted-foreground">{err.terjemahan}</p>
                    )}
                    <JsonBlock data={err.body} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Section title="HTTP Status Codes yang mungkin">
            <div className="flex flex-wrap gap-1.5">
              {endpoint.status_codes.map((c) => (
                <Badge key={c} variant="outline" className="rounded-full font-mono text-xs">
                  {c}
                </Badge>
              ))}
            </div>
          </Section>

          {endpoint.side_effects.length > 0 && (
            <Section title="Side Effects" icon={<ZapIcon className="size-4 text-warning" />}>
              <ul className="flex flex-col gap-1 text-sm">
                {endpoint.side_effects.map((se) => (
                  <li key={se} className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-warning" />
                    <span className="font-mono text-xs">{se}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {(endpoint.related_page || endpoint.controller) && (
            <Section title="Terkait">
              <div className="flex flex-wrap gap-2">
                {endpoint.related_page && (
                  <Button asChild size="xs" variant="outline">
                    <Link href={endpoint.related_page}>
                      Halaman: <span className="font-mono">{endpoint.related_page}</span>
                      <ExternalLinkIcon className="size-3" />
                    </Link>
                  </Button>
                )}
                {endpoint.controller && (
                  <Badge variant="outline" className="rounded-full gap-1 px-3 py-1 text-xs font-normal text-muted-foreground">
                    Controller: <span className="font-mono text-foreground">{endpoint.controller}::{endpoint.action}</span>
                  </Badge>
                )}
                {endpoint.form_request && (
                  <Badge variant="outline" className="rounded-full gap-1 px-3 py-1 text-xs font-normal text-muted-foreground">
                    FormRequest: <span className="font-mono text-foreground">{endpoint.form_request}</span>
                  </Badge>
                )}
                {endpoint.response_resource && (
                  <Badge variant="outline" className="rounded-full gap-1 px-3 py-1 text-xs font-normal text-muted-foreground">
                    Resource: <span className="font-mono text-foreground">{endpoint.response_resource}</span>
                  </Badge>
                )}
              </div>
            </Section>
          )}

          {Array.isArray(endpoint.related_endpoints) && endpoint.related_endpoints.length > 0 && typeof endpoint.related_endpoints[0] === "object" && (
            <Section title="Endpoint Terkait (controller sama)">
              <ul className="flex flex-col gap-1 text-xs">
                {(endpoint.related_endpoints as Array<{ id: string; method: string; path: string; summary: string }>).map((r) => (
                  <li key={r.id} className="flex items-center gap-2 rounded-xl border border-border px-3 py-1.5">
                    <MethodBadge method={r.method} />
                    <code className="font-mono">{r.path}</code>
                    <span className="text-muted-foreground">— {r.summary}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
