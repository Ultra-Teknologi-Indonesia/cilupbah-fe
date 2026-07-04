import { PickingProsesView } from "@/components/dashboard/proses-pesanan/picking/picking-proses-view";

export default async function PickingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PickingProsesView id={id} />;
}
