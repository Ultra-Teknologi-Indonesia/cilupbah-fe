"use client"

import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/ui/page-skeleton"

export default function PosisiStokLoading() {
  return (
    <phantom-ui loading animation="pulse">
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={8} cols={6} />
      </div>
    </phantom-ui>
  )
}
