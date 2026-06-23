"use client"

import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/ui/page-skeleton"

export default function LokasiLoading() {
  return (
    <phantom-ui loading animation="pulse">
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={5} cols={4} />
      </div>
    </phantom-ui>
  )
}
