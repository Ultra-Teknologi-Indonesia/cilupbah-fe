import { EditProdukLoader } from "@/components/dashboard/master-produk/buat/edit-produk-loader"

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <EditProdukLoader id={id} />
}
