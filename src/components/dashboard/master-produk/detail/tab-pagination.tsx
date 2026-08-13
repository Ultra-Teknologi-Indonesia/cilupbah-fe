"use client";

import {
  SimplePagination,
  TABLE_PAGE_SIZES,
} from "@/components/ui/simple-pagination";
import { StatusBadge } from "@/components/dashboard/shared/status-badge";
import { cn } from "@/lib/utils";

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

export function SyncStatusBadge({
  status,
  reason,
  className,
}: {
  status: string | null;
  reason?: string | null;
  className?: string;
}) {
  const s = status ?? "";
  const failed = s === "rejected" || s === "failed";

  return (
    <span title={reason && failed ? reason : undefined}>
      <StatusBadge
        domain="channel-listing-sync"
        status={s}
        className={cn("px-2 py-0.5 text-2xs font-medium", className)}
      />
    </span>
  );
}
