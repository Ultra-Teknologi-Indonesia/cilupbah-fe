"use client";

import { ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import type { ConnectedStore } from "@/types/channel";
import { ChannelLogo } from "./channel-logo";
import { StoreRowActions } from "./store-row-actions";

const NOTE_STYLE: Record<string, string> = {
  normal: "text-muted-foreground",
  pending: "text-warning",
  problem: "text-destructive",
  nonaktif: "text-muted-foreground",
};

export function StoreCard({
  store,
  onToggleActive,
  onToggleOrders,
  onRefresh,
  onReauth,
  onDisconnect,
}: {
  store: ConnectedStore;
  onToggleActive: (id: string, value: boolean) => void;
  onToggleOrders: (id: string, value: boolean) => void;
  onRefresh: (store: ConnectedStore) => void;
  onReauth: (store: ConnectedStore) => void;
  onDisconnect: (store: ConnectedStore) => void;
}) {
  const status = store.orderSync.status;
  const needsReauth =
    store.integration.action === "reauth" ||
    store.orderSync.action === "reauth";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <ChannelLogo
            code={store.channel.code}
            name={store.channel.name}
            className="size-9 shrink-0"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-primary">
              {store.shopName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {store.channel.name}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <StatusBadge domain="order-download" status={status} />
          <StoreRowActions
            store={store}
            onRefresh={onRefresh}
            onReauth={onReauth}
            onDisconnect={onDisconnect}
          />
        </div>
      </div>

      <div className="space-y-0.5">
        {store.orderSync.note && (
          <p className={cn("text-xs", NOTE_STYLE[status] ?? "text-muted-foreground")}>
            {store.orderSync.note}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Terakhir di-update: {relativeTime(store.lastOrderSyncedAt)}
        </p>
        {store.accessNote && (
          <p className="text-xs text-destructive">{store.accessNote}</p>
        )}
        {store.linkedStore && (
          <div className="flex items-center gap-1.5 pt-0.5 text-xs text-muted-foreground">
            <ChannelLogo
              code={store.linkedStore.code}
              name={store.linkedStore.name}
              className="size-4"
            />
            <span className="truncate">{store.linkedStore.name}</span>
          </div>
        )}
      </div>

      {needsReauth && (
        <Button
          size="sm"
          onClick={() => onReauth(store)}
          className="w-full gap-1.5"
        >
          <ExternalLink className="size-3.5" />
          Hubungkan Ulang
        </Button>
      )}

      <div className="mt-auto flex items-center justify-between gap-4 border-t border-border/60 pt-3">
        <div className="flex items-center gap-2">
          <Switch
            checked={store.isActive}
            onCheckedChange={(v) => onToggleActive(store.id, v)}
            aria-label={`Toko aktif ${store.shopName}`}
          />
          <span className="text-xs text-muted-foreground">Toko Aktif</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={store.ordersEnabled}
            onCheckedChange={(v) => onToggleOrders(store.id, v)}
            aria-label={`Sinkron pesanan ${store.shopName}`}
          />
          <span className="text-xs text-muted-foreground">Sinkron Pesanan</span>
        </div>
      </div>
    </div>
  );
}
