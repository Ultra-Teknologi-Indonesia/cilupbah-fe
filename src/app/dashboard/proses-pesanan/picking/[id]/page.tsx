import { PickingDetailView } from "@/components/dashboard/proses-pesanan/picking/picking-detail-view"

export default async function PickingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PickingDetailView id={id} />
}
