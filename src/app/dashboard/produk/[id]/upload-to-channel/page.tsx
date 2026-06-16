import { PageTitle } from "@/components/dashboard/page-title"
import { UploadToChannelView } from "@/components/dashboard/master-produk/upload-to-channel/upload-to-channel-view"

export default async function UploadToChannelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="flex flex-col gap-6">
      <PageTitle
        title="Upload ke Channel"
        breadcrumb={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Katalog" },
          { label: "Produk", href: "/dashboard/master-produk" },
          { label: "Upload ke Channel" },
        ]}
      />

      <UploadToChannelView id={id} />
    </div>
  )
}
