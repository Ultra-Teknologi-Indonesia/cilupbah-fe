"use client";

import * as React from "react";
import Link from "next/link";
import { BellIcon, CheckCheckIcon, Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { NotifikasiItem } from "@/components/dashboard/notifikasi/notifikasi-item";
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadNotificationCount,
} from "@/hooks/notification/use-notifications";
import { sortByPriority } from "@/lib/notification";

export function NotificationsPopover() {
  const [open, setOpen] = React.useState(false);
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data, isLoading } = useNotifications({ per_page: 5 });
  const markAll = useMarkAllNotificationsRead();

  const items = React.useMemo(
    () => sortByPriority(data?.items ?? []),
    [data?.items],
  );
  const disableMarkAll = markAll.isPending || unreadCount === 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
          aria-label="Buka notifikasi"
        >
          <BellIcon className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-2xs font-semibold text-white shadow-sm">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" className="my-6 w-80 p-1.5">
        <DropdownMenuLabel className="flex items-center justify-between gap-2 px-2 py-1.5">
          <span className="text-sm font-semibold">Notifikasi</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 rounded-full px-2 text-xs font-medium"
            onClick={() => markAll.mutate()}
            disabled={disableMarkAll}
          >
            {markAll.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <CheckCheckIcon />
            )}
            Tandai semua
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-3 px-1 py-1.5">
                  <Skeleton className="size-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-2/3" />
                    <Skeleton className="h-3 w-4/5" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="px-3 py-6 text-center text-xs text-muted-foreground">
              Belum ada notifikasi.
            </div>
          ) : (
            <div className="space-y-0.5 p-1">
              {items.map((n) => (
                <NotifikasiItem
                  key={n.id}
                  notification={n}
                  variant="compact"
                  onNavigate={() => setOpen(false)}
                />
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator />
        <Link
          href="/dashboard/notifikasi"
          onClick={() => setOpen(false)}
          className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
        >
          Lihat semua notifikasi
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
