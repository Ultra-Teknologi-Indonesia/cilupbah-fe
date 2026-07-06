import { TransferKeluarFormPage } from "@/components/dashboard/barang-keluar/transfer-keluar-form-page";

export default async function EditTransferKeluarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TransferKeluarFormPage mode="edit" id={id} />;
}
