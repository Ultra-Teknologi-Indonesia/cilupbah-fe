
export function openBinTransferPdf(id: string): void {
  window.open(
    `/dashboard/document-preview/bin-transfer-out/${id}`,
    "_blank",
    "noopener,noreferrer",
  );
}
