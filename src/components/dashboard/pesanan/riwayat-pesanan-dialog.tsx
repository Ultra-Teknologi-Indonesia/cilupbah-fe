"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
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

interface Cluster {
  key: string;
  head: OrderActivity;
  members: OrderActivity[];
}

interface DayGroup {
  key: string;
  label: string;
  clusters: Cluster[];
}

const CLUSTER_WINDOW_MS = 60_000;

function clusterActivities(items: OrderActivity[]): Cluster[] {
  const clusters: Cluster[] = [];
  let current: Cluster | null = null;
  for (const item of items) {
    const time = new Date(item.action_date).getTime();
    const canAppend =
      current &&
      current.head.email === item.email &&
      current.head.action_label === item.action_label &&
      Math.abs(new Date(current.head.action_date).getTime() - time) <=
        CLUSTER_WINDOW_MS;
    if (canAppend && current) {
      current.members.push(item);
    } else {
      current = { key: item.id, head: item, members: [item] };
      clusters.push(current);
    }
  }
  return clusters;
}

function groupByDay(items: OrderActivity[], cluster: boolean): DayGroup[] {
  const buckets = new Map<string, OrderActivity[]>();
  const order: string[] = [];
  for (const item of items) {
    const date = new Date(item.action_date);
    const key = format(date, "yyyy-MM-dd");
    if (!buckets.has(key)) {
      buckets.set(key, []);
      order.push(key);
    }
    buckets.get(key)!.push(item);
  }
  return order.map((key) => {
    const bucket = buckets.get(key)!;
    const label = format(new Date(bucket[0]!.action_date), "d MMM yyyy", {
      locale: idLocale,
    });
    const clusters = cluster
      ? clusterActivities(bucket)
      : bucket.map((item) => ({ key: item.id, head: item, members: [item] }));
    return { key, label, clusters };
  });
}

function ChangeCard({ activity }: { activity: OrderActivity }) {
  const entries = useMemo(() => {
    const prev = activity.prev_values ?? {};
    const next = activity.new_values ?? {};
    const keys = new Set<string>([...Object.keys(prev), ...Object.keys(next)]);
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
        <div className="mt-2 text-xs text-muted-foreground">
          {activity.note}
        </div>
      ) : null}
    </div>
  );
}

function TimelineRow({ cluster }: { cluster: Cluster }) {
  const [expanded, setExpanded] = useState(false);
  const head = cluster.head;
  const time = format(new Date(head.action_date), "HH:mm");
  const extra = cluster.members.length - 1;
  return (
    <li className="relative flex gap-3 pb-4 pl-6 last:pb-0">
      <span className="absolute left-0 top-1.5 size-3 rounded-full bg-primary" />
      <span className="absolute left-[5px] top-4 h-full w-px bg-border" />
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{time}</span>
          {extra > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground"
            >
              {expanded ? "Ciutkan" : `${cluster.members.length} aksi berturut`}
            </button>
          ) : null}
        </div>
        <div className="text-sm font-medium">{head.email}</div>
        <ChangeCard activity={head} />
        {expanded && extra > 0 ? (
          <div className="space-y-2 pt-2">
            {cluster.members.slice(1).map((member) => (
              <ChangeCard key={member.id} activity={member} />
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function RiwayatPesananDialog({
  orderId,
  open,
  onOpenChange,
}: RiwayatPesananDialogProps) {
  const [cluster, setCluster] = useState(true);
  const query = useOrderActivities(orderId, open);
  const items = useMemo(
    () => query.data?.pages.flatMap((page) => page.data) ?? [],
    [query.data],
  );
  const groups = useMemo(() => groupByDay(items, cluster), [items, cluster]);

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
          <div className="flex items-center justify-between">
            <DialogTitle>Riwayat</DialogTitle>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <Switch checked={cluster} onCheckedChange={setCluster} />
              Ringkas
            </label>
          </div>
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
                    {group.clusters.map((cluster) => (
                      <TimelineRow key={cluster.key} cluster={cluster} />
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
