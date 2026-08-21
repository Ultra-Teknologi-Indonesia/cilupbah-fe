import { PenyesuaianFormPage } from "@/components/dashboard/transaksi-stok/buat-penyesuaian-view";

export default async function EditPenyesuaianPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PenyesuaianFormPage mode="edit" id={id} />;
}
