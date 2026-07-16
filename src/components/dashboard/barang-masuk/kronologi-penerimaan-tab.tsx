"use client";

import * as React from "react";
import { Loader2Icon, PackageIcon, UserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { SimplePagination } from "@/components/ui/simple-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";
import { useInboundReceipts } from "@/hooks/barang-masuk/use-inbound";
import type { Inbound, InboundReceipt } from "@/types/barang-masuk/inbound";

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

function formatDateHeader(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const base = `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  if (sameDay) return `Hari ini · ${base}`;
  if (isYesterday) return `Kemarin · ${base}`;
  return base;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function dateKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

interface StaffSummary {
  userId: string;
  name: string;
  totalQty: number;
  eventCount: number;
  isActive: boolean;
}

export function KronologiPenerimaanTab({ inbound }: { inbound: Inbound }) {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(50);
  const [userFilter, setUserFilter] = React.useState<string | null>(null);
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [debouncedFrom, setDebouncedFrom] = React.useState("");
  const [debouncedTo, setDebouncedTo] = React.useState("");

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedFrom(dateFrom);
      setDebouncedTo(dateTo);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [dateFrom, dateTo]);

  const summaryQuery = useInboundReceipts(inbound.id, {
    page: 1,
    per_page: 500,
  });

  const { data, isLoading, isFetching } = useInboundReceipts(inbound.id, {
    page,
    per_page: perPage,
    "filter[received_by_user_id]": userFilter ?? undefined,
    "filter[date_from]": debouncedFrom || undefined,
    "filter[date_to]": debouncedTo || undefined,
    sort: "-received_date",
  });

  const rows = data?.data ?? [];
  const meta = data?.meta;

  const staffSummary = React.useMemo<StaffSummary[]>(() => {
    const activeUserIds = new Set(
      (inbound.participants ?? [])
        .filter((p) => p.status === "ACTIVE")
        .map((p) => p.user_id),
    );
    const acc = new Map<string, StaffSummary>();
    for (const r of summaryQuery.data?.data ?? []) {
      const uid = r.received_by_user_id ?? "unknown";
      const name = r.received_by_user?.name ?? "Staff";
      const cur = acc.get(uid) ?? {
        userId: uid,
        name,
        totalQty: 0,
        eventCount: 0,
        isActive: activeUserIds.has(uid),
      };
      cur.totalQty += r.qty;
      cur.eventCount += 1;
      acc.set(uid, cur);
    }
    return Array.from(acc.values()).sort((a, b) => b.totalQty - a.totalQty);
  }, [summaryQuery.data, inbound.participants]);

  const grandTotalQty = staffSummary.reduce((s, x) => s + x.totalQty, 0);
  const grandEvents = staffSummary.reduce((s, x) => s + x.eventCount, 0);

  const groupedRows = React.useMemo(() => {
    const groups = new Map<string, { header: string; items: InboundReceipt[] }>();
    for (const r of rows) {
      const key = dateKey(r.received_date);
      const existing = groups.get(key);
      if (existing) {
        existing.items.push(r);
      } else {
        groups.set(key, { header: formatDateHeader(r.received_date), items: [r] });
      }
    }
    return Array.from(groups.values());
  }, [rows]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold">Ringkasan per Staff</h4>
          <p className="text-xs text-muted-foreground">
            {grandTotalQty} pcs
            {" · "}
            {grandEvents} event
            {" · "}
            {staffSummary.length} staff
          </p>
        </div>

        {summaryQuery.isLoading ? (
          <div className="flex h-20 items-center justify-center text-muted-foreground">
            <Loader2Icon className="size-4 animate-spin" />
          </div>
        ) : staffSummary.length === 0 ? (
          <EmptyState
            title="Belum ada penerimaan"
            description="Setiap staff yang scan akan muncul di sini."
            icon={UserIcon}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {staffSummary.map((s) => {
              const selected = userFilter === s.userId;
              return (
                <button
                  key={s.userId}
                  type="button"
                  onClick={() => {
                    setUserFilter(selected ? null : s.userId);
                    setPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                    "hover:border-primary/40 hover:bg-muted/40",
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card",
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                    aria-hidden
                  >
                    {initials(s.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">
                        {s.name}
                      </span>
                      {s.isActive && (
                        <Badge
                          variant="outline"
                          className="border-success/40 text-2xs text-success"
                        >
                          Aktif
                        </Badge>
                      )}
                    </div>
                    <p className="text-2xs text-muted-foreground">
                      {s.eventCount} event
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-base font-semibold tabular-nums">
                      {s.totalQty}
                    </span>
                    <span className="text-2xs text-muted-foreground">pcs</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Dari tanggal</label>
            <Input
              type="datetime-local"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-56"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground">Sampai</label>
            <Input
              type="datetime-local"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-56"
            />
          </div>
          {(userFilter || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              onClick={() => {
                setUserFilter(null);
                setDateFrom("");
                setDateTo("");
                setPage(1);
              }}
            >
              Reset
            </Button>
          )}
          {isFetching && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2Icon className="size-3 animate-spin" /> Memuat
            </span>
          )}
        </div>

        {userFilter && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Menampilkan event dari</span>
            <Badge variant="outline" className="text-2xs">
              {staffSummary.find((s) => s.userId === userFilter)?.name ??
                "staff"}
            </Badge>
            <span>· klik chip staff lagi untuk lepas filter</span>
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 bg-muted/30">
                <TableHead className="w-20 px-3 py-2.5 text-2xs uppercase tracking-wider text-muted-foreground">
                  Jam
                </TableHead>
                <TableHead className="min-w-48 px-3 py-2.5 text-2xs uppercase tracking-wider text-muted-foreground">
                  Staff
                </TableHead>
                <TableHead className="min-w-64 px-3 py-2.5 text-2xs uppercase tracking-wider text-muted-foreground">
                  Produk
                </TableHead>
                <TableHead className="w-24 px-3 py-2.5 text-right text-2xs uppercase tracking-wider text-muted-foreground">
                  Qty
                </TableHead>
                <TableHead className="w-24 px-3 py-2.5 text-2xs uppercase tracking-wider text-muted-foreground">
                  Kondisi
                </TableHead>
                <TableHead className="min-w-36 px-3 py-2.5 text-2xs uppercase tracking-wider text-muted-foreground">
                  Bin · Batch
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <Loader2Icon className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : groupedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10">
                    <EmptyState
                      title="Belum ada kronologi"
                      description={
                        userFilter || dateFrom || dateTo
                          ? "Tidak ada event yang cocok dengan filter. Coba reset filter."
                          : "Setiap penerimaan barang akan tercatat di sini."
                      }
                      icon={PackageIcon}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                groupedRows.map((group) => (
                  <React.Fragment key={group.header}>
                    <TableRow className="border-b border-border/40 bg-muted/20 hover:bg-muted/20">
                      <TableCell
                        colSpan={6}
                        className="px-3 py-2 text-2xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {group.header}
                      </TableCell>
                    </TableRow>
                    {group.items.map((r) => {
                      const staffName = r.received_by_user?.name;
                      const variant = r.inbound_item?.variant;
                      const productName = variant?.product?.name;
                      const batchSerial = [r.batch_no, r.serial_no]
                        .filter(Boolean)
                        .join(" · ");
                      const damage = r.condition === "DAMAGE";
                      return (
                        <TableRow
                          key={r.id}
                          className="border-b border-border/30 last:border-0"
                        >
                          <TableCell className="px-3 py-3 align-top tabular-nums text-sm text-muted-foreground">
                            {formatTime(r.received_date)}
                          </TableCell>
                          <TableCell className="px-3 py-3 align-top">
                            <div className="flex items-center gap-2">
                              <div
                                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-2xs font-semibold text-foreground"
                                aria-hidden
                              >
                                {initials(staffName)}
                              </div>
                              <span className="text-sm font-medium">
                                {staffName ?? (
                                  <span className="text-muted-foreground">
                                    Staff dihapus
                                  </span>
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-2xs text-muted-foreground">
                                {variant?.sku ?? "—"}
                              </span>
                              <span className="text-sm font-medium">
                                {productName ?? "—"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="px-3 py-3 text-right align-top">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2 py-0.5 text-sm font-semibold tabular-nums",
                                damage
                                  ? "bg-destructive/10 text-destructive"
                                  : "bg-primary/10 text-primary",
                              )}
                            >
                              {damage ? "" : "+"}
                              {r.qty}
                            </span>
                          </TableCell>
                          <TableCell className="px-3 py-3 align-top">
                            {damage ? (
                              <Badge
                                variant="outline"
                                className="border-destructive/40 text-2xs text-destructive"
                              >
                                Rusak
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="text-2xs text-muted-foreground"
                              >
                                Baik
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="px-3 py-3 align-top">
                            <div className="flex flex-col gap-0.5">
                              <span className="font-mono text-2xs text-muted-foreground">
                                {r.bin?.bin_final_code ?? r.bin?.code ?? "—"}
                              </span>
                              {batchSerial && (
                                <span className="text-2xs text-muted-foreground">
                                  {batchSerial}
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 1 && (
          <SimplePagination
            page={page}
            lastPage={meta.last_page}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={(n) => {
              setPerPage(n);
              setPage(1);
            }}
            total={meta.total}
            label="event"
          />
        )}
      </section>
    </div>
  );
}
