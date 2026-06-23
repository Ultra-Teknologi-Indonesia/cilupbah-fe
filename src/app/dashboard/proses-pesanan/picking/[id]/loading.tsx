"use client"

import {
  PageHeaderSkeleton,
  DetailSkeleton,
} from "@/components/ui/page-skeleton"

export default function PickingDetailLoading() {
  return (
    <phantom-ui loading animation="pulse">
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <DetailSkeleton />
      </div>
    </phantom-ui>
  )
}
