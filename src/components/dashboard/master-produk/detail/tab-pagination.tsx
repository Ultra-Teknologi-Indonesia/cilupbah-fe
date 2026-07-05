"use client";

import {
  SimplePagination,
  TABLE_PAGE_SIZES,
} from "@/components/ui/simple-pagination";

const PAGE_SIZES = TABLE_PAGE_SIZES;

export function TabPagination({
  page,
  perPage,
  lastPage,
  isFetching,
  onPage,
  onPerPage,
}: {
  page: number;
  perPage: number;
  lastPage: number;
  isFetching?: boolean;
  onPage: (p: number) => void;
  onPerPage: (n: number) => void;
}) {
  return (
    <SimplePagination
      page={page}
      lastPage={lastPage}
      onPageChange={onPage}
      perPage={perPage}
      onPerPageChange={onPerPage}
      pageSizeOptions={PAGE_SIZES}
      isFetching={isFetching}
    />
  );
}

const STATUS_STYLE: Record<string, string> = {
  synced: "text-success bg-success/10",
  in_review: "text-warning bg-warning/10",
  pending: "text-warning bg-warning/10",
  syncing: "text-warning bg-warning/10",
  rejected: "text-destructive bg-destructive/10",
  failed: "text-destructive bg-destructive/10",
  deactivated: "text-muted-foreground bg-muted",
};
const STATUS_LABEL: Record<string, string> = {
  synced: "Tersinkron",
  in_review: "Direview",
  pending: "Menunggu",
  syncing: "Sinkron…",
  rejected: "Ditolak",
  failed: "Gagal",
  deactivated: "Nonaktif",
};

export function SyncStatusBadge({
  status,
  reason,
}: {
  status: string | null;
  reason?: string | null;
}) {
  const s = status ?? "";
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-2xs font-medium ${STATUS_STYLE[s] ?? "text-muted-foreground bg-muted"}`}
      title={
        reason && (s === "rejected" || s === "failed") ? reason : undefined
      }
    >
      {STATUS_LABEL[s] ?? s ?? "—"}
    </span>
  );
}
