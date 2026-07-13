"use client";

import * as React from "react";
import Link from "next/link";
import { ExternalLinkIcon, ShieldIcon, ZapIcon, AlertTriangleIcon, InfoIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CopyJsonButton } from "@/components/bantuan/copy-json-button";
import { MethodBadge } from "./method-badge";
import { JsonBlock } from "./json-block";
import type { ApiDocEndpoint } from "@/lib/bantuan/types";

function Section({
  title,
  icon,
  copyData,
  copyLabel,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  copyData?: unknown;
  copyLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-2 border-t border-border pt-4 first:border-none first:pt-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {copyData !== undefined && (
          <CopyJsonButton data={copyData} label={copyLabel ?? "Copy JSON"} size="sm" variant="ghost" />
        )}
      </div>
      {children}
    </section>
  );
}

export function EndpointDetail({ endpoint }: { endpoint: ApiDocEndpoint }) {
  return (
    <Card className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <MethodBadge method={endpoint.method} />
          <code className="rounded-md bg-muted px-2 py-1 text-xs font-mono">{endpoint.path}</code>
          {endpoint.deprecated && (
            <Badge variant="destructive" className="rounded-full">Deprecated</Badge>
          )}
          {endpoint.needs_doc && (
            <Badge variant="outline" className="rounded-full text-warning border-warning/40">
              PHPDoc belum ditulis
            </Badge>
          )}
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{endpoint.summary || endpoint.id}</h2>
            {endpoint.description && (
              <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{endpoint.description}</p>
            )}
          </div>
          <CopyJsonButton data={endpoint} label="Copy JSON endpoint" />
        </div>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-1 gap-3 rounded-xl bg-muted/50 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
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
          <div className="font-mono text-foreground">{endpoint.rate_limit ?? "60/menit (default)"}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Route Name</div>
          <div className="font-mono text-foreground truncate" title={endpoint.id}>{endpoint.id}</div>
        </div>
      </div>

      {/* Purpose */}
      {endpoint.purpose && (
        <Section title="Untuk apa" icon={<InfoIcon className="size-4 text-primary" />}>
          <p className="text-sm text-foreground">{endpoint.purpose}</p>
        </Section>
      )}

      {/* Roles */}
      {endpoint.roles.length > 0 && (
        <Section title="Peran / Permission" icon={<ShieldIcon className="size-4 text-primary" />} copyData={endpoint.roles} copyLabel="Copy roles">
          <div className="flex flex-wrap gap-1.5">
            {endpoint.roles.map((r) => (
              <Badge key={r} variant="outline" className="rounded-full font-mono text-xs">
                {r}
              </Badge>
            ))}
          </div>
        </Section>
      )}

      {/* Path params */}
      {endpoint.path_params.length > 0 && (
        <Section title="Path Parameters" copyData={endpoint.path_params} copyLabel="Copy path params">
          <ul className="flex flex-col gap-2 text-sm">
            {endpoint.path_params.map((p) => (
              <li key={p.name} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{p.name}</code>
                  <span className="text-xs text-muted-foreground">{p.type}</span>
                  {p.required && <Badge variant="outline" className="rounded-full text-[10px]">wajib</Badge>}
                </div>
                {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Allowed filters (Spatie QueryBuilder) */}
      {endpoint.allowed_filters && endpoint.allowed_filters.length > 0 && (
        <Section title="Filter yang Diizinkan (Spatie QueryBuilder)" copyData={endpoint.allowed_filters} copyLabel="Copy filters">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Nama</th>
                  <th className="px-3 py-2 text-left font-semibold">Tipe</th>
                  <th className="px-3 py-2 text-left font-semibold">Kolom / Scope</th>
                  <th className="px-3 py-2 text-left font-semibold">Contoh Pemakaian</th>
                  <th className="px-3 py-2 text-left font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {endpoint.allowed_filters.map((f) => (
                  <tr key={f.name} className="align-top">
                    <td className="px-3 py-2 font-mono">{f.name}</td>
                    <td className="px-3 py-2">
                      <Badge variant="outline" className="rounded-full text-[10px]">{f.type}</Badge>
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">{f.column || f.scope || "—"}</td>
                    <td className="px-3 py-2 font-mono">{f.usage_example ?? `?filter[${f.name}]=value`}</td>
                    <td className="px-3 py-2">
                      <div>{f.description}</div>
                      {f.enum && f.enum.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-[10px] text-muted-foreground">Nilai valid:</span>
                          {f.enum.map((v) => (
                            <code key={v} className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{v}</code>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Allowed search */}
      {endpoint.allowed_search && endpoint.allowed_search.length > 0 && (
        <Section title="Kolom Search yang Diizinkan" copyData={endpoint.allowed_search} copyLabel="Copy search">
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

      {/* Allowed sorts */}
      {endpoint.allowed_sorts && endpoint.allowed_sorts.length > 0 && (
        <Section title="Kolom Sort yang Diizinkan" copyData={endpoint.allowed_sorts} copyLabel="Copy sorts">
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

      {/* Allowed includes */}
      {endpoint.allowed_includes && endpoint.allowed_includes.length > 0 && (
        <Section title="Relasi yang Bisa Di-include" copyData={endpoint.allowed_includes} copyLabel="Copy includes">
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

      {/* Allowed fields */}
      {endpoint.allowed_fields && endpoint.allowed_fields.length > 0 && (
        <Section title="Sparse Fields yang Diizinkan" copyData={endpoint.allowed_fields} copyLabel="Copy fields">
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

      {/* Query params */}
      {endpoint.query_params.length > 0 && (
        <Section title="Query Parameters" copyData={endpoint.query_params} copyLabel="Copy query params">
          <ul className="flex flex-col gap-1 text-sm">
            {endpoint.query_params.map((p) => (
              <li key={p.name} className="flex items-start gap-2">
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{p.name}</code>
                <span className="text-xs text-muted-foreground">{p.type}</span>
                <span className="text-xs text-foreground">{p.description}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Body schema */}
      {Object.keys(endpoint.body_schema).length > 0 && (
        <Section title="Body Schema (dari FormRequest)" copyData={endpoint.body_schema} copyLabel="Copy schema">
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-xs">
              <thead className="bg-muted">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Field</th>
                  <th className="px-3 py-2 text-left font-semibold">Tipe</th>
                  <th className="px-3 py-2 text-left font-semibold">Wajib</th>
                  <th className="px-3 py-2 text-left font-semibold">Aturan / Constraint</th>
                  <th className="px-3 py-2 text-left font-semibold">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Object.entries(endpoint.body_schema).map(([field, spec]) => (
                  <tr key={field} className="align-top">
                    <td className="px-3 py-2 font-mono">{field}</td>
                    <td className="px-3 py-2">{spec.type}</td>
                    <td className="px-3 py-2">
                      {spec.required ? <span className="text-destructive">wajib</span> : <span className="text-muted-foreground">opsional</span>}
                    </td>
                    <td className="px-3 py-2 font-mono">
                      {spec.rules.join(" | ")}
                      {spec.enum && spec.enum.length > 0 && (
                        <div className="mt-1 text-primary">enum: {spec.enum.join(", ")}</div>
                      )}
                      {spec.exists && <div className="mt-1 text-muted-foreground">exists: {spec.exists}</div>}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{spec.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
      )}

      {/* Validation flat list */}
      {endpoint.validation.length > 0 && (
        <Section title="Validation Rules (flat)" copyData={endpoint.validation} copyLabel="Copy validation">
          <pre className="overflow-x-auto rounded-xl bg-muted p-4 text-xs font-mono leading-relaxed">
            {endpoint.validation.join("\n")}
          </pre>
        </Section>
      )}

      {/* Body example */}
      {Object.keys(endpoint.body_example).length > 0 && (
        <Section title="Body Example (contoh valid)" copyData={endpoint.body_example} copyLabel="Copy body example">
          <JsonBlock data={endpoint.body_example} />
        </Section>
      )}

      {/* Response success */}
      <Section title="Response Sukses" copyData={{ schema: endpoint.response_success_schema, example: endpoint.response_success_example }} copyLabel="Copy response">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <JsonBlock label="Schema" data={endpoint.response_success_schema} copyLabel="Copy schema" />
          <JsonBlock label="Example" data={endpoint.response_success_example} copyLabel="Copy example" />
        </div>
      </Section>

      {/* Response errors */}
      {endpoint.response_errors.length > 0 && (
        <Section title="Response Error" icon={<AlertTriangleIcon className="size-4 text-destructive" />} copyData={endpoint.response_errors} copyLabel="Copy errors">
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
                <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs font-mono">
                  {JSON.stringify(err.body, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Status codes */}
      <Section title="HTTP Status Codes yang mungkin">
        <div className="flex flex-wrap gap-1.5">
          {endpoint.status_codes.map((c) => (
            <Badge key={c} variant="outline" className="rounded-full font-mono text-xs">
              {c}
            </Badge>
          ))}
        </div>
      </Section>

      {/* Side effects */}
      {endpoint.side_effects.length > 0 && (
        <Section title="Side Effects" icon={<ZapIcon className="size-4 text-warning" />} copyData={endpoint.side_effects} copyLabel="Copy side effects">
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

      {/* Related */}
      {(endpoint.related_page || endpoint.controller) && (
        <Section title="Terkait">
          <div className="flex flex-wrap gap-2 text-xs">
            {endpoint.related_page && (
              <Link
                href={endpoint.related_page}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 hover:bg-muted"
              >
                Halaman: <span className="font-mono">{endpoint.related_page}</span>
                <ExternalLinkIcon className="size-3" />
              </Link>
            )}
            {endpoint.controller && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                Controller: <span className="font-mono text-foreground">{endpoint.controller}::{endpoint.action}</span>
              </span>
            )}
            {endpoint.form_request && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                FormRequest: <span className="font-mono text-foreground">{endpoint.form_request}</span>
              </span>
            )}
            {endpoint.response_resource && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-muted-foreground">
                Resource: <span className="font-mono text-foreground">{endpoint.response_resource}</span>
              </span>
            )}
          </div>
        </Section>
      )}

      {/* Related endpoints (same-controller) */}
      {Array.isArray(endpoint.related_endpoints) && endpoint.related_endpoints.length > 0 && typeof endpoint.related_endpoints[0] === "object" && (
        <Section
          title="Endpoint Terkait (controller sama)"
          copyData={endpoint.related_endpoints}
          copyLabel="Copy related"
        >
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
    </Card>
  );
}
