"use client";

import { useEffect, useMemo, useRef } from "react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { History, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrderActivities } from "@/hooks/pesanan/use-order-activities";
import {
  formatRiwayatValue,
  labelForAction,
  labelForField,
} from "@/lib/pesanan/riwayat-field-map";
import type { OrderActivity } from "@/types/pesanan/activity";

interface RiwayatPesananDialogProps {
  orderId: string | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface DayGroup {
  key: string;
  label: string;
  items: OrderActivity[];
}

function groupByDay(items: OrderActivity[]): DayGroup[] {
  const groups = new Map<string, DayGroup>();
  for (const item of items) {
    const date = new Date(item.action_date);
    const key = format(date, "yyyy-MM-dd");
    const label = format(date, "d MMM yyyy", { locale: idLocale });
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { key, label, items: [item] });
    }
  }
  return Array.from(groups.values());
}

function ChangeCard({ activity }: { activity: OrderActivity }) {
  const entries = useMemo(() => {
    const prev = activity.prev_values ?? {};
    const next = activity.new_values ?? {};
    const keys = new Set<string>([
      ...Object.keys(prev),
      ...Object.keys(next),
    ]);
    return Array.from(keys).map((key) => ({
      key,
      label: labelForField(key),
      prev: formatRiwayatValue((prev as Record<string, unknown>)[key]),
      next: formatRiwayatValue((next as Record<string, unknown>)[key]),
    }));
  }, [activity.prev_values, activity.new_values]);

  return (
    <div className="rounded-xl border bg-muted/40 p-3 text-sm">
      <div className="mb-2 font-medium text-foreground">
        {labelForAction(activity.action_label)}
        {activity.entity_no ? (
          <span className="text-muted-foreground">
            {" "}
            di {activity.entity_no}
          </span>
        ) : null}
      </div>
      {entries.length === 0 ? (
        <div className="text-muted-foreground">
          {activity.note ?? "Tidak ada perubahan data."}
        </div>
      ) : (
        <ul className="space-y-1">
          {entries.map((entry) => (
            <li key={entry.key} className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {entry.label}:
              </span>{" "}
              <span className="break-words">{entry.prev}</span>
              <span className="mx-1 text-muted-foreground">→</span>
              <span className="break-words text-foreground">{entry.next}</span>
            </li>
          ))}
        </ul>
      )}
      {activity.note ? (
        <div className="mt-2 text-xs text-muted-foreground">{activity.note}</div>
      ) : null}
    </div>
  );
}

function TimelineRow({ activity }: { activity: OrderActivity }) {
  const time = format(new Date(activity.action_date), "HH:mm");
  return (
    <li className="relative flex gap-3 pb-4 pl-6 last:pb-0">
      <span className="absolute left-0 top-1.5 size-3 rounded-full bg-primary" />
      <span className="absolute left-[5px] top-4 h-full w-px bg-border" />
      <div className="flex-1 space-y-1">
        <div className="text-xs text-muted-foreground">{time}</div>
        <div className="text-sm font-medium">{activity.email}</div>
        <ChangeCard activity={activity} />
      </div>
    </li>
  );
}

export function RiwayatPesananDialog({
  orderId,
  open,
  onOpenChange,
}: RiwayatPesananDialogProps) {
  const query = useOrderActivities(orderId, open);
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );
  const groups = useMemo(() => groupByDay(items), [items]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !query.hasNextPage) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && !query.isFetchingNextPage) {
        query.fetchNextPage();
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Riwayat</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {query.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : query.isError ? (
            <EmptyState
              icon={History}
              title="Gagal memuat riwayat"
              description="Terjadi kesalahan saat mengambil data. Coba muat ulang."
              action={
                <Button
                  variant="outline"
                  onClick={() => query.refetch()}
                  className="rounded-full"
                >
                  Muat ulang
                </Button>
              }
            />
          ) : groups.length === 0 ? (
            <EmptyState
              icon={History}
              title="Belum ada riwayat"
              description="Riwayat aktivitas pesanan akan tampil di sini."
            />
          ) : (
            <div className="space-y-6">
              {groups.map((group) => (
                <section key={group.key}>
                  <h3 className="mb-3 text-sm font-semibold">{group.label}</h3>
                  <ol className="relative">
                    {group.items.map((activity) => (
                      <TimelineRow key={activity.id} activity={activity} />
                    ))}
                  </ol>
                </section>
              ))}
              <div ref={sentinelRef} className="h-8" />
              {query.isFetchingNextPage ? (
                <div className="flex justify-center py-2 text-sm text-muted-foreground">
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Memuat lebih banyak…
                </div>
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
