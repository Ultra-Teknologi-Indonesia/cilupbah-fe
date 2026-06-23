"use client"

import {
  PageHeaderSkeleton,
  CardGridSkeleton,
} from "@/components/ui/page-skeleton"

export default function DashboardLoading() {
  return (
    <phantom-ui loading animation="pulse">
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <CardGridSkeleton count={4} />
      </div>
    </phantom-ui>
  )
}
