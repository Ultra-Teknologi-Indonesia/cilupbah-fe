"use client";

import { useMemo } from "react";
import { HistoryIcon, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/format";
import { usePurchaseOrderActivities } from "@/hooks/transaksi-pembelian/use-purchase-order-activities";
import {
  labelForAction,
  labelForField,
  formatRiwayatValue,
} from "@/lib/transaksi-pembelian/riwayat-field-map";
import type { PurchaseOrderActivity } from "@/types/transaksi-pembelian/activity";

function ChangeRow({
  field,
  prev,
  next,
}: {
  field: string;
  prev: unknown;
  next: unknown;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="text-muted-foreground">{labelForField(field)}</span>
      <span className="line-through text-muted-foreground/70 tabular-nums">
        {formatRiwayatValue(field, prev)}
      </span>
      <span className="text-muted-foreground">→</span>
      <span className="font-medium tabular-nums text-foreground">
        {formatRiwayatValue(field, next)}
      </span>
    </div>
  );
}

function ActivityRow({ activity }: { activity: PurchaseOrderActivity }) {
  const fields = useMemo(() => {
    const keys = new Set([
      ...Object.keys(activity.prev_values ?? {}),
      ...Object.keys(activity.new_values ?? {}),
    ]);
    return Array.from(keys);
  }, [activity.prev_values, activity.new_values]);

  return (
    <li className="flex gap-3 border-b border-border/40 py-3 last:border-0">
      <div className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium text-foreground">
            {labelForAction(activity.action)}
          </span>
          {activity.entity_no && (
            <span className="font-mono text-2xs text-muted-foreground">
              {activity.entity_no}
            </span>
          )}
          {activity.qty !== null && (
            <span className="text-xs tabular-nums text-muted-foreground">
              {activity.qty} unit
            </span>
          )}
        </div>

        {fields.length > 0 && (
          <div className="flex flex-col gap-0.5">
            {fields.map((field) => (
              <ChangeRow
                key={field}
                field={field}
                prev={activity.prev_values?.[field]}
                next={activity.new_values?.[field]}
              />
            ))}
          </div>
        )}

        {activity.note && (
          <p className="text-xs text-muted-foreground">{activity.note}</p>
        )}

        <div className="flex flex-wrap items-center gap-x-2 text-2xs text-muted-foreground">
          <span>{activity.actor_name ?? "System"}</span>
          <span>·</span>
          <span>{formatDateTime(activity.created_at)}</span>
        </div>
      </div>
    </li>
  );
}

export function RiwayatPesananPembelianDialog({
  poId,
  poNumber,
  open,
  onOpenChange,
}: {
  poId: string;
  poNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePurchaseOrderActivities(poId, open);

  const activities = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Riwayat {poNumber}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={HistoryIcon}
            title="Belum ada riwayat"
            description="Perubahan pada pesanan ini akan tercatat di sini."
          />
        ) : (
          <>
            <ul className="flex flex-col">
              {activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} />
              ))}
            </ul>

            {hasNextPage && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="mx-auto"
              >
                {isFetchingNextPage && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                Muat lebih banyak
              </Button>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
