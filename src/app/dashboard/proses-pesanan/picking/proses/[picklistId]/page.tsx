import { PickingProsesView } from "@/components/dashboard/proses-pesanan/picking/picking-proses-view"

export default async function PickingProsesPage({
  params,
}: {
  params: Promise<{ picklistId: string }>
}) {
  const { picklistId } = await params
  return <PickingProsesView id={picklistId} />
}
