/**
 * Buka surat jalan Transfer Internal (bin-transfer) di tab baru.
 *
 * Konsisten dengan komponen lain (transfer-out, penyesuaian, dst.): preview PDF
 * lewat halaman custom `document-preview` — bukan membuka URL proxy langsung.
 * Registry tipe `bin-transfer-out` yang mengambil PDF dari
 * `GET /inventory/bin-transfers/{id}/pdf` lalu menampilkannya di preview kustom.
 */
export function openBinTransferPdf(id: string): void {
  window.open(
    `/dashboard/document-preview/bin-transfer-out/${id}`,
    "_blank",
    "noopener,noreferrer",
  );
}
