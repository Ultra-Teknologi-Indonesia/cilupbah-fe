import { LocationDetailView } from "@/components/dashboard/manajemen-rak/lokasi/location-detail-view";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LocationDetailView id={id} />;
}
