"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  CheckIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useDeleteNotification,
  useMarkNotificationRead,
} from "@/hooks/notification/use-notifications";
import {
  DOMAIN_LABEL,
  getNotificationMeta,
  notificationToneClass,
  severityBorderClass,
} from "@/lib/notification";
import type { AppNotification } from "@/types/notification";

interface NotifikasiItemProps {
  notification: AppNotification;
  variant?: "row" | "compact";
  onNavigate?: () => void;
}

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), {
      locale: idLocale,
      addSuffix: true,
    });
  } catch {
    return "";
  }
}

export function NotifikasiItem({
  notification,
  variant = "row",
  onNavigate,
}: NotifikasiItemProps) {
  const router = useRouter();
  const markRead = useMarkNotificationRead();
  const remove = useDeleteNotification();

  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  const link =
    typeof notification.data?.link === "string"
      ? notification.data.link
      : undefined;
  const unread = !notification.is_read;

  const activate = React.useCallback(() => {
    if (unread) markRead.mutate(notification.id);
    if (link) {
      router.push(link);
      onNavigate?.();
    }
  }, [unread, link, markRead, notification.id, router, onNavigate]);

  const body = (
    <div className="flex min-w-0 flex-1 items-start gap-3">
      <span
        className={cn(
          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl",
          notificationToneClass(meta.tone),
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "min-w-0 truncate text-sm text-foreground",
              unread && "font-semibold",
            )}
          >
            {notification.title}
          </p>
          {unread && (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              aria-label="Belum dibaca"
            />
          )}
        </div>
        {notification.message && (
          <p
            className={cn(
              "text-xs text-muted-foreground",
              variant === "compact" && "line-clamp-1",
            )}
          >
            {notification.message}
          </p>
        )}
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-muted px-1.5 text-2xs font-medium text-muted-foreground">
            {DOMAIN_LABEL[meta.domain]}
          </span>
          <span className="text-2xs text-muted-foreground/80">·</span>
          <span className="text-2xs text-muted-foreground/80">
            {relativeTime(notification.created_at)}
          </span>
        </div>
      </div>
    </div>
  );

  if (variant === "compact") {
    const commonClass = cn(
      "block w-full rounded-xl px-3 py-2 text-left transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
      unread && "bg-muted/40",
      severityBorderClass(meta.severity),
    );
    if (link) {
      return (
        <Link href={link} className={commonClass} onClick={activate}>
          {body}
        </Link>
      );
    }
    return (
      <button
        type="button"
        className={commonClass}
        onClick={activate}
        disabled={!unread && !link}
      >
        {body}
      </button>
    );
  }

  return (
    <div
      className={cn(
        "relative flex items-start gap-2 rounded-xl px-3 py-3 transition-colors hover:bg-muted",
        unread && "bg-muted/30",
        severityBorderClass(meta.severity),
      )}
    >
      <div
        role="button"
        tabIndex={0}
        onClick={activate}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate();
          }
        }}
        className="flex min-w-0 flex-1 cursor-pointer items-start gap-3 rounded-xl focus-visible:outline-none"
      >
        {body}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full text-muted-foreground"
            aria-label="Aksi notifikasi"
          >
            <MoreHorizontalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {unread && (
            <DropdownMenuItem
              onClick={() => markRead.mutate(notification.id)}
              disabled={markRead.isPending}
            >
              {markRead.isPending ? (
                <Loader2Icon className="animate-spin" />
              ) : (
                <CheckIcon />
              )}
              Tandai dibaca
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={() => remove.mutate(notification.id)}
            variant="destructive"
            disabled={remove.isPending}
          >
            {remove.isPending ? (
              <Loader2Icon className="animate-spin" />
            ) : (
              <Trash2Icon />
            )}
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
