"use client";

import * as React from "react";
import Image from "next/image";
import {
  EyeIcon,
  EyeOffIcon,
  ImageIcon,
  Link2OffIcon,
  Loader2Icon,
  PackageIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  useHideMasters,
  useUnhideMasters,
  useUnmergeMaster,
} from "@/hooks/master-produk/use-product-merge";
import type { MergeGroup, MergeGroupProduct } from "@/types/product-merge";
import { MergeChannelChips } from "./merge-channel-chips";

interface Props {
  group: MergeGroup;
  selectedIds: Set<string>;
  onToggleProduct: (product: MergeGroupProduct) => void;
  canUnmerge: boolean;
  canHide: boolean;
}

export function MergeGroupCard({
  group,
  selectedIds,
  onToggleProduct,
  canUnmerge,
  canHide,
}: Props) {
  const [unmergeOpen, setUnmergeOpen] = React.useState(false);

  const unmergeMaster = useUnmergeMaster();
  const hideMasters = useHideMasters();
  const unhideMasters = useUnhideMasters();

  const selectable = !group.merged && !group.hidden;

  return (
    <>
      <div className="rounded-4xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
            {group.foto ? (
              <Image
                unoptimized
                fill
                sizes="64px"
                src={group.foto}
                alt={group.name}
                className="object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center">
                <ImageIcon className="size-6 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground" title={group.name}>
                  {group.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {group.category || "Tanpa kategori"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {group.merged ? (
                  <Badge variant="success">Tergabung</Badge>
                ) : (
                  <Badge variant="warning">Belum digabung</Badge>
                )}
                {group.hidden && <Badge variant="outline">Disembunyikan</Badge>}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <PackageIcon className="size-3.5" />
                {group.product_count} produk
              </span>
              <span>{group.sku_count} SKU</span>
              <MergeChannelChips channels={group.channels} />
            </div>
          </div>
        </div>

        <ul className="mt-4 space-y-1.5">
          {group.products.map((p) => {
            const checked = selectedIds.has(p.id);
            const row = (
              <div className="flex items-center gap-2 rounded-xl px-2 py-1.5">
                {selectable && (
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggleProduct(p)}
                    aria-label={`Pilih ${p.name}`}
                  />
                )}
                <span className="min-w-0 flex-1 truncate text-sm" title={p.name}>
                  {p.name}
                </span>
                {p.sku && (
                  <span className="shrink-0 rounded-xl bg-muted px-2 py-0.5 font-mono text-2xs text-muted-foreground">
                    {p.sku}
                  </span>
                )}
              </div>
            );

            return (
              <li key={p.id}>
                {selectable ? (
                  <label
                    className={cn(
                      "block cursor-pointer rounded-xl transition-colors hover:bg-muted/60",
                      checked && "bg-primary/5",
                    )}
                  >
                    {row}
                  </label>
                ) : (
                  row
                )}
              </li>
            );
          })}
        </ul>

        {(group.merged || group.hidden) && (
          <div className="mt-3 flex flex-wrap justify-end gap-2 border-t border-border pt-3">
            {group.hidden
              ? canHide && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={unhideMasters.isPending}
                    onClick={() => unhideMasters.mutate([group.name])}
                  >
                    {unhideMasters.isPending ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <EyeIcon />
                    )}
                    Tampilkan
                  </Button>
                )
              : canHide && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={hideMasters.isPending}
                    onClick={() => hideMasters.mutate([group.name])}
                  >
                    {hideMasters.isPending ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      <EyeOffIcon />
                    )}
                    Sembunyikan
                  </Button>
                )}

            {group.merged && canUnmerge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUnmergeOpen(true)}
              >
                <Link2OffIcon />
                Lepas gabungan
              </Button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={unmergeOpen}
        onOpenChange={setUnmergeOpen}
        title="Lepas gabungan?"
        description={`Semua produk pada "${group.name}" kembali tampil sebagai produk terpisah.`}
        confirmLabel="Lepas gabungan"
        variant="destructive"
        loading={unmergeMaster.isPending}
        onConfirm={() =>
          unmergeMaster.mutate(group.name, {
            onSuccess: () => setUnmergeOpen(false),
          })
        }
      />
    </>
  );
}
