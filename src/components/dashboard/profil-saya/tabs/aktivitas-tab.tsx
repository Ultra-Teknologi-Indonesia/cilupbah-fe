"use client";

import * as React from "react";
import { ClockIcon, FileTextIcon, MonitorIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SimplePagination } from "@/components/ui/simple-pagination";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMyHistories, useMyLoginHistories } from "@/hooks/auth/use-profile";
import { formatDateTime } from "@/lib/format";
import type {
  LoginHistoryEntry,
  UserHistoryEntry,
} from "@/types/auth/auth.types";

const DEFAULT_PER_PAGE = 20;

export function AktivitasTab() {
  return (
    <div className="grid grid-cols-1 gap-6">
      <RiwayatLoginCard />
      <RiwayatAktivitasCard />
    </div>
  );
}

function RiwayatLoginCard() {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(DEFAULT_PER_PAGE);
  const query = useMyLoginHistories({ page, per_page: perPage });
  const rows: LoginHistoryEntry[] = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Login</CardTitle>
        <CardDescription>
          Catatan sesi masuk ke akun beserta perangkat dan lokasi kasar.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Perangkat</TableHead>
                <TableHead>Alamat IP</TableHead>
                <TableHead>Lokasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-0">
                    <EmptyState
                      icon={ClockIcon}
                      title="Belum ada riwayat login"
                      description="Riwayat login akan muncul di sini setelah Anda masuk kembali."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(row.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      <DeviceLine
                        os={row.agent_os}
                        browser={row.agent_browser}
                        device={row.agent_device}
                      />
                    </TableCell>
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {row.ip_address ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatLocation(row)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 0 ? (
          <SimplePagination
            page={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            total={meta.total}
            label="riwayat"
            isFetching={query.isFetching}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function RiwayatAktivitasCard() {
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(DEFAULT_PER_PAGE);
  const query = useMyHistories({ page, per_page: perPage });
  const rows: UserHistoryEntry[] = query.data?.data ?? [];
  const meta = query.data?.meta;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Aktivitas</CardTitle>
        <CardDescription>
          Perubahan pada profil dan akun Anda oleh administrator atau sistem.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu</TableHead>
                <TableHead>Aktor</TableHead>
                <TableHead>Aksi</TableHead>
                <TableHead>Pesan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {query.isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="p-0">
                    <EmptyState
                      icon={FileTextIcon}
                      title="Belum ada riwayat aktivitas"
                      description="Perubahan akun yang tercatat akan muncul di sini."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(row.created_at)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {row.actor?.name ?? "Sistem"}
                    </TableCell>
                    <TableCell className="text-sm capitalize">
                      {row.action.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="text-sm">{row.message}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {meta && meta.last_page > 0 ? (
          <SimplePagination
            page={meta.current_page}
            lastPage={meta.last_page}
            onPageChange={setPage}
            perPage={perPage}
            onPerPageChange={setPerPage}
            total={meta.total}
            label="aktivitas"
            isFetching={query.isFetching}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}

function DeviceLine({
  os,
  browser,
  device,
}: {
  os: string | null;
  browser: string | null;
  device: string | null;
}) {
  const parts = [browser, os, device].filter(Boolean);
  if (parts.length === 0)
    return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex items-center gap-2">
      <MonitorIcon className="size-3.5 text-muted-foreground" />
      <span>{parts.join(" · ")}</span>
    </div>
  );
}

function formatLocation(row: LoginHistoryEntry): string {
  const parts = [row.location_city, row.location_region, row.location_country]
    .filter(Boolean)
    .join(", ");
  return parts || "—";
}
