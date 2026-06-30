import { DocumentPreviewView } from "@/components/dashboard/document-preview/document-preview-view"

export default async function DocumentPreviewPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>
}) {
  const { type, id } = await params
  return <DocumentPreviewView type={type} id={id} />
}
