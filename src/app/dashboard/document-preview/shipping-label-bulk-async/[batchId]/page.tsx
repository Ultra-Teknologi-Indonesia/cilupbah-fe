import { BulkLabelPreviewView } from "@/components/dashboard/document-preview/bulk-label-preview-view";

export default async function ShippingLabelBulkAsyncPreviewPage({
  params,
}: {
  params: Promise<{ batchId: string }>;
}) {
  const { batchId } = await params;
  return <BulkLabelPreviewView batchId={batchId} />;
}
