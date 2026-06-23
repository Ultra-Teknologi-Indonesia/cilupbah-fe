"use client"

import {
  PageHeaderSkeleton,
  TabBarSkeleton,
  TableSkeleton,
} from "@/components/ui/page-skeleton"

export default function NaikkanDetailLoading() {
  return (
    <phantom-ui loading animation="pulse">
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <TabBarSkeleton />
        <TableSkeleton rows={6} cols={4} />
      </div>
    </phantom-ui>
  )
}
