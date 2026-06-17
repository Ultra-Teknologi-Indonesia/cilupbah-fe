import { LocationFormPage } from "@/components/dashboard/pengaturan/lokasi/location-form-page"

export default async function EditLokasiPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <LocationFormPage mode="edit" id={id} />
}
