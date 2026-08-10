"use client";

import { SparklesIcon, WandSparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MergeSuggestion } from "@/types/product-merge";

interface Props {
  suggestions: MergeSuggestion[];
  canMerge: boolean;
  onMerge: (suggestion: MergeSuggestion) => void;
}

export function MergeSuggestionsPanel({
  suggestions,
  canMerge,
  onMerge,
}: Props) {
  if (suggestions.length === 0) return null;

  return (
    <section className="rounded-4xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="size-4 text-primary" />
        <h2 className="text-sm font-semibold text-foreground">
          Saran gabung ({suggestions.length})
        </h2>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Produk yang terdeteksi kembar antar-link marketplace. Periksa lalu
        gabungkan.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {suggestions.map((s) => (
          <div
            key={`${s.prefix}-${s.suggested_master_name}`}
            className="flex flex-col rounded-xl border border-border bg-card p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p
                className="min-w-0 truncate text-sm font-medium"
                title={s.suggested_master_name}
              >
                {s.suggested_master_name}
              </p>
              {s.existing_master && (
                <Badge variant="secondary" className="shrink-0">
                  Master lama
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-2xs text-muted-foreground">{s.prefix}</p>

            <ul className="mt-2 flex-1 space-y-1">
              {s.products.map((p) => (
                <li
                  key={p.id}
                  className="truncate text-xs text-muted-foreground"
                  title={p.name}
                >
                  • {p.name}
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              size="sm"
              className="mt-3 self-start"
              disabled={!canMerge || s.total < 2}
              onClick={() => onMerge(s)}
            >
              <WandSparklesIcon />
              Gabungkan {s.total}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
