"use client";

import Link from "next/link";

import { usePrefetchPicklistDetail } from "@/hooks/proses-pesanan/use-fulfillment";

export function PicklistLinkCell({
  picklistId,
  picklistNo,
}: {
  picklistId?: string | null;
  picklistNo?: string | null;
}) {
  const prefetch = usePrefetchPicklistDetail();

  if (!picklistId || !picklistNo) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <Link
      href={`/dashboard/proses-pesanan/picking/proses/${picklistId}`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={() => prefetch(picklistId)}
      onFocus={() => prefetch(picklistId)}
      className="block max-w-[160px] truncate text-sm font-medium text-primary hover:underline"
    >
      {picklistNo}
    </Link>
  );
}
