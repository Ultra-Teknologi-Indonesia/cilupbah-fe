import { PermintaanRestockDetailView } from "@/components/dashboard/gudang/permintaan-restock/permintaan-restock-detail-view";

export default async function PermintaanRestockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PermintaanRestockDetailView id={id} />;
}
