"use client";

import * as React from "react";
import { BellIcon, CheckCheckIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTitle } from "@/components/dashboard/page-title";
import { NotifikasiItem } from "@/components/dashboard/notifikasi/notifikasi-item";
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/notification/use-notifications";

type TabKey = "all" | "unread";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function ItemSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-xl px-3 py-3">
      <Skeleton className="size-9 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function NotifikasiView() {
  const [tab, setTab] = React.useState<TabKey>("all");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  React.useEffect(() => {
    setPage(1);
  }, [tab, perPage]);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading, isFetching } = useNotifications({
    per_page: perPage,
    page,
    ...(tab === "unread" ? { is_read: false } : {}),
  });
  const markAll = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const lastPage = meta?.last_page ?? 0;
  const disableMarkAll = markAll.isPending || unreadCount === 0;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Notifikasi"
        description="Pemberitahuan aktivitas dari sistem."
      />

      <LiquidGlass
        radius={24}
        intensity="default"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as TabKey)}
            className="flex-none"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList variant="glass">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="unread">
                  Belum dibaca
                  {unreadCount > 0 && (
                    <span className="ml-1.5 rounded-full bg-primary/10 px-1.5 text-2xs font-semibold text-primary">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => markAll.mutate()}
                disabled={disableMarkAll}
              >
                {markAll.isPending ? (
                  <Loader2Icon className="animate-spin" />
                ) : (
                  <CheckCheckIcon />
                )}
                Tandai semua dibaca
              </Button>
            </div>
          </Tabs>

          <div className="min-h-64">
            {isLoading ? (
              <div className="divide-y divide-border/60">
                {Array.from({ length: 5 }).map((_, i) => (
                  <ItemSkeleton key={i} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={BellIcon}
                title={
                  tab === "unread"
                    ? "Semua notifikasi sudah dibaca"
                    : "Belum ada notifikasi"
                }
                description={
                  tab === "unread"
                    ? "Notifikasi baru akan muncul di sini."
                    : "Pemberitahuan aktivitas akan muncul di sini."
                }
              />
            ) : (
              <ul className="divide-y divide-border/60">
                {items.map((n) => (
                  <li key={n.id}>
                    <NotifikasiItem notification={n} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(items.length > 0 || (meta && lastPage > 0)) && (
            <SimplePagination
              page={page}
              lastPage={lastPage}
              onPageChange={setPage}
              perPage={perPage}
              onPerPageChange={setPerPage}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
              isFetching={isFetching}
              total={total}
              label="notifikasi"
            />
          )}
        </div>
      </LiquidGlass>
    </div>
  );
}
