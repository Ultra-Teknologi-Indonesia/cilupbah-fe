"use client";

import * as React from "react";
import {
  useRouter,
  useSearchParams,
  usePathname,
} from "next/navigation";
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
import {
  DOMAIN_LABEL,
  getNotificationMeta,
  listDomains,
  type NotificationDomain,
} from "@/lib/notification";

type TabKey = "all" | "unread";
type DomainKey = NotificationDomain | "all";

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 20;

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

function parseTab(v: string | null): TabKey {
  return v === "unread" ? "unread" : "all";
}

function parseDomain(v: string | null): DomainKey {
  if (!v) return "all";
  const domains = listDomains();
  return (domains as string[]).includes(v) ? (v as DomainKey) : "all";
}

function parsePositive(v: string | null, fallback: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}

export function NotifikasiView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = parseTab(searchParams.get("tab"));
  const domain = parseDomain(searchParams.get("domain"));
  const page = parsePositive(searchParams.get("page"), 1);
  const perPage = parsePositive(
    searchParams.get("per_page"),
    DEFAULT_PAGE_SIZE,
  );

  const setParams = React.useCallback(
    (next: Partial<Record<string, string | number | undefined>>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === "" || v === "all") {
          params.delete(k);
        } else {
          params.set(k, String(v));
        }
      });
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setTab = (v: TabKey) => setParams({ tab: v, page: undefined });
  const setDomain = (v: DomainKey) =>
    setParams({ domain: v, page: undefined });
  const setPage = (v: number) => setParams({ page: v });
  const setPerPage = (v: number) =>
    setParams({ per_page: v, page: undefined });

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading, isFetching } = useNotifications({
    per_page: perPage,
    page,
    ...(tab === "unread" ? { is_read: false } : {}),
  });
  const markAll = useMarkAllNotificationsRead();

  const rawItems = React.useMemo(() => data?.items ?? [], [data]);
  const meta = data?.meta;
  const total = meta?.total ?? 0;
  const lastPage = meta?.last_page ?? 0;

  const items = React.useMemo(() => {
    if (domain === "all") return rawItems;
    return rawItems.filter(
      (n) => getNotificationMeta(n.type).domain === domain,
    );
  }, [rawItems, domain]);

  const disableMarkAll = markAll.isPending || unreadCount === 0;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Notifikasi"
        description="Pemberitahuan aktivitas dari sistem."
      />

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

      <LiquidGlass
        radius={24}
        intensity="default"
        className="bg-white/40 dark:bg-white/[0.06]"
      >
        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <Tabs
            value={domain}
            onValueChange={(v) => setDomain(v as DomainKey)}
            className="border-b border-border/60"
          >
            <TabsList variant="line" className="-mb-px overflow-x-auto">
              <TabsTrigger value="all">Semua domain</TabsTrigger>
              {listDomains().map((d) => (
                <TabsTrigger key={d} value={d}>
                  {DOMAIN_LABEL[d]}
                </TabsTrigger>
              ))}
            </TabsList>
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
                    : domain === "all"
                      ? "Belum ada notifikasi"
                      : `Belum ada notifikasi ${DOMAIN_LABEL[domain as NotificationDomain].toLowerCase()}`
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
