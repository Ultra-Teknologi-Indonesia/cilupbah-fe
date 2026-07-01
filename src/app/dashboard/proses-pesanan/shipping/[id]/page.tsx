import { ShipmentDetailView } from "@/components/dashboard/proses-pesanan/shipping/shipment-detail-view"

export default async function ShipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ShipmentDetailView id={id} />
}
