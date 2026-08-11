"use client";

import * as React from "react";
import { SparklesIcon, WandSparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/hooks/auth/use-permissions";
import {
  useApplyMerge,
  useMergeSuggestions,
} from "@/hooks/master-produk/use-product-merge";
import type { MergeSuggestion } from "@/types/product-merge";
import { MergeApplyDialog } from "./merge-apply-dialog";

export function MergeSuggestionsButton() {
  const { can } = usePermissions();
  const canMerge = can("merge-product");

  const [open, setOpen] = React.useState(false);
  const [target, setTarget] = React.useState<MergeSuggestion | null>(null);

  const suggestionsQuery = useMergeSuggestions("", open && canMerge);
  const applyMerge = useApplyMerge();

  if (!canMerge) return null;

  const suggestions = suggestionsQuery.data ?? [];

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <SparklesIcon className="size-4" />
        Saran gabung
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Saran gabung</DialogTitle>
            <DialogDescription>
              Produk yang terdeteksi kembar antar-link marketplace. Periksa lalu
              gabungkan.
            </DialogDescription>
          </DialogHeader>

          {suggestionsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <EmptyState
              icon={SparklesIcon}
              title="Tidak ada saran"
              description="Belum ada produk kembar yang terdeteksi."
            />
          ) : (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {suggestions.map((s) => (
                <div
                  key={`${s.prefix}-${s.suggested_master_name}`}
                  className="rounded-xl border border-border bg-card p-3"
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
                  <p className="mt-0.5 text-2xs text-muted-foreground">
                    {s.prefix}
                  </p>
                  <ul className="mt-2 space-y-0.5">
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
                    className="mt-3"
                    disabled={s.total < 2}
                    onClick={() => setTarget(s)}
                  >
                    <WandSparklesIcon />
                    Gabungkan {s.total}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MergeApplyDialog
        open={target !== null}
        onOpenChange={(o) => !o && setTarget(null)}
        products={(target?.products ?? []).map((p) => ({
          id: p.id,
          name: p.name,
        }))}
        defaultMasterName={target?.suggested_master_name ?? ""}
        loading={applyMerge.isPending}
        onConfirm={(masterName) => {
          if (!target) return;
          applyMerge.mutate(
            { masterName, productIds: target.products.map((p) => p.id) },
            {
              onSuccess: () => {
                setTarget(null);
                setOpen(false);
              },
            },
          );
        }}
      />
    </>
  );
}
