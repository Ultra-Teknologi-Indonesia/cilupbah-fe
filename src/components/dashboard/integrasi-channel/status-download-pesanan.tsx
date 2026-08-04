"use client";

import * as React from "react";
import { PackageSearchIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { relativeTime } from "@/lib/format";
import type { ConnectedStore } from "@/types/channel";
import { ChannelLogo } from "./channel-logo";

interface StatusDownloadPesananProps {
  stores: ConnectedStore[];
}

export function StatusDownloadPesanan({ stores }: StatusDownloadPesananProps) {
  if (stores.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <PackageSearchIcon className="size-5 text-muted-foreground" />
          Status Download Pesanan
        </CardTitle>
        <CardDescription>
          Kesehatan sinkronisasi pesanan per toko. Normal berarti pesanan masuk
          lancar; Bermasalah berarti pesanan tidak masuk atau sinkron gagal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stores.map((store) => (
            <div
              key={store.id}
              className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3"
            >
              <ChannelLogo
                code={store.channel.code}
                name={store.channel.name}
                className="size-8 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {store.shopName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {store.channel.name}
                    </p>
                  </div>
                  <StatusBadge
                    domain="order-download"
                    status={store.orderSync.status}
                  />
                </div>
                {store.orderSync.note ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {store.orderSync.note}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Terakhir di-update: {relativeTime(store.lastOrderSyncedAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
