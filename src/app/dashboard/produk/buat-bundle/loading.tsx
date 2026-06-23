"use client"

import {
  PageHeaderSkeleton,
  FormSkeleton,
} from "@/components/ui/page-skeleton"

export default function BuatBundleLoading() {
  return (
    <phantom-ui loading animation="pulse">
      <div className="flex flex-col gap-6">
        <PageHeaderSkeleton />
        <FormSkeleton />
      </div>
    </phantom-ui>
  )
}
