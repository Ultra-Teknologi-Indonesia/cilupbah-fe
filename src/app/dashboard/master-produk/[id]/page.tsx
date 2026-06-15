import { ProductDetailView } from "@/components/dashboard/master-produk/detail/product-detail-view"

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <ProductDetailView id={id} />
}
