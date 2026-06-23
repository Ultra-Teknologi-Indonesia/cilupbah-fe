import { PackingDetailView } from "@/components/dashboard/proses-pesanan/packing/packing-detail-view"

export default async function PackingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PackingDetailView id={id} />
}
