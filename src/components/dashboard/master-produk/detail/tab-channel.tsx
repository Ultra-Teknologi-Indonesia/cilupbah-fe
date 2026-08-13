"use client";

import * as React from "react";
import { ExternalLinkIcon, StoreIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { ChannelLogo } from "@/components/dashboard/integrasi-channel/channel-logo";
import { useProductChannelListings } from "@/hooks/master-produk/use-product-tabs";
import { SyncStatusBadge, TabPagination } from "./tab-pagination";
import type { ChannelListingRow } from "@/hooks/master-produk/use-product-tabs";
import type { ChannelCode } from "@/types/channel";

type Listing = ChannelListingRow["listings"][number];

interface ChannelBucket {
  code: ChannelCode;
  name: string;
  listings: Listing[];
}

const CHANNEL_ORDER = [
  "shopee",
  "tiktok",
  "tokopedia",
  "lazada",
  "woocommerce",
  "blibli",
];

function bucketByChannel(listings: Listing[]): ChannelBucket[] {
  const buckets = new Map<string, ChannelBucket>();

  for (const listing of listings) {
    const code = (listing.channelCode ?? "unknown") as ChannelCode;
    const bucket = buckets.get(code) ?? {
      code,
      name: listing.channelName ?? listing.channelCode ?? "Channel lain",
      listings: [],
    };
    bucket.listings.push(listing);
    buckets.set(code, bucket);
  }

  return [...buckets.values()].sort((a, b) => {
    const ai = CHANNEL_ORDER.indexOf(a.code);
    const bi = CHANNEL_ORDER.indexOf(b.code);
    return (
      (ai === -1 ? CHANNEL_ORDER.length : ai) -
      (bi === -1 ? CHANNEL_ORDER.length : bi)
    );
  });
}

function ListingRow({ listing }: { listing: Listing }) {
  return (
    <li className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors hover:bg-muted/60">
      <span
        className="min-w-0 flex-1 truncate text-xs text-foreground"
        title={listing.shopName ?? undefined}
      >
        {listing.shopName ?? "Tanpa nama toko"}
      </span>
      <SyncStatusBadge
        status={listing.syncStatus}
        reason={listing.errorMessage}
      />
      {listing.channelUrl ? (
        <Button
          asChild
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-primary"
        >
          <a
            href={listing.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={listing.channelUrl}
            aria-label={`Buka listing di ${listing.channelName ?? "channel"}`}
          >
            <ExternalLinkIcon />
          </a>
        </Button>
      ) : (
        <span
          className="grid size-6 place-items-center text-2xs text-muted-foreground"
          title="Listing ini tidak punya tautan"
        >
          —
        </span>
      )}
    </li>
  );
}

function VariantCard({ row }: { row: ChannelListingRow }) {
  const buckets = React.useMemo(
    () => bucketByChannel(row.listings),
    [row.listings],
  );

  return (
    <div className="rounded-4xl border border-border/60 bg-card p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-border/60 pb-3">
        <span className="font-mono text-sm font-medium text-primary">
          {row.sku}
        </span>
        {row.options.map((option, i) => (
          <span
            key={i}
            className="rounded-xl bg-muted px-2 py-0.5 text-2xs text-foreground/80"
          >
            {option.value}
          </span>
        ))}
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {row.listings.length} listing
        </span>
      </div>

      {buckets.length === 0 ? (
        <p className="pt-3 text-xs text-muted-foreground">
          Varian ini belum ter-listing di channel mana pun.
        </p>
      ) : (
        <div className="grid gap-3 pt-3 lg:grid-cols-2 xl:grid-cols-3">
          {buckets.map((bucket) => (
            <div
              key={bucket.code}
              className="rounded-xl border border-border/60 bg-muted/30 p-3"
            >
              <div className="flex items-center gap-2">
                <ChannelLogo
                  code={bucket.code}
                  name={bucket.name}
                  className="size-6 text-2xs"
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {bucket.name}
                </span>
                <span className="text-2xs text-muted-foreground tabular-nums">
                  {bucket.listings.length}
                </span>
              </div>
              <ul className="mt-2 space-y-0.5">
                {bucket.listings.map((listing, i) => (
                  <ListingRow key={i} listing={listing} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TabChannel({ productId }: { productId: string }) {
  const [channel, setChannel] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(20);

  const { data, isLoading, isError, refetch, isFetching } =
    useProductChannelListings(
      productId,
      { page, perPage, channel: channel || undefined },
      true,
    );

  const rows = React.useMemo(() => data?.items ?? [], [data]);
  const meta = data?.meta;
  const lastPage = meta?.last_page ?? 1;
  const total = meta?.total ?? 0;

  const channelOptions = React.useMemo(() => {
    const m = new Map<string, string>();
    rows.forEach((r) =>
      r.listings.forEach((l) => {
        if (l.channelCode) m.set(l.channelCode, l.channelName ?? l.channelCode);
      }),
    );
    return [...m.entries()];
  }, [rows]);

  const listingCount = React.useMemo(
    () => rows.reduce((sum, r) => sum + r.listings.length, 0),
    [rows],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          value={channel || "all"}
          onValueChange={(v) => {
            setChannel(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="h-9 w-[220px]">
            <SelectValue placeholder="Semua channel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua channel</SelectItem>
            {channelOptions.map(([code, name]) => (
              <SelectItem key={code} value={code}>
                <span className="flex items-center gap-2">
                  <ChannelLogo
                    code={code as ChannelCode}
                    name={name}
                    className="size-4 text-2xs"
                  />
                  {name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular-nums">
            {total}
          </span>{" "}
          varian ter-listing
          {listingCount > 0 && (
            <>
              {" · "}
              <span className="font-semibold text-foreground tabular-nums">
                {listingCount}
              </span>{" "}
              listing di halaman ini
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-4xl" />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          title="Gagal memuat listing channel"
          description="Periksa koneksi lalu muat ulang data."
          action={
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Coba lagi
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={StoreIcon}
          title="Belum ada listing channel"
          description={
            channel
              ? "Tidak ditemukan listing untuk channel yang dipilih."
              : "Produk ini belum diunggah ke marketplace mana pun."
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {rows.map((row) => (
            <VariantCard key={row.variantId} row={row} />
          ))}
        </div>
      )}

      {rows.length > 0 && (
        <TabPagination
          page={page}
          perPage={perPage}
          lastPage={lastPage}
          isFetching={isFetching}
          onPage={setPage}
          onPerPage={(n) => {
            setPerPage(n);
            setPage(1);
          }}
        />
      )}
    </div>
  );
}
