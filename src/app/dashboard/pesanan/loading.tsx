"use client"

import {
  PageHeaderSkeleton,
  TableSkeleton,
} from "@/components/ui/page-skeleton"

export default function PesananLoading() {
  return (
    <phantom-ui loading animation="pulse">
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <TableSkeleton rows={6} cols={6} />
      </div>
    </phantom-ui>
  )
}
