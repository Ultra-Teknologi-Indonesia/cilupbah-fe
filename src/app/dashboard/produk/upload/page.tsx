import { Suspense } from "react"

import { PageTitle } from "@/components/dashboard/page-title"
import { UploadMassalView } from "@/components/dashboard/master-produk/upload/upload-massal-view"

export default function UploadMassalPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Upload Massal"
        description="Upload produk master ke marketplace."
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk" },
          { label: "Upload Massal" },
        ]}
      />

      <Suspense fallback={null}>
        <UploadMassalView />
      </Suspense>
    </div>
  )
}
