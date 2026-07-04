import { TokoInternalFormPage } from "@/components/dashboard/toko-internal/toko-internal-form-page";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTokoInternalPage({ params }: Props) {
  const { id } = await params;
  return <TokoInternalFormPage mode="edit" id={id} />;
}
