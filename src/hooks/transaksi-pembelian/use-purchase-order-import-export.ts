import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PurchaseOrderService } from "@/services/transaksi-pembelian/purchase-order.service";
import type {
  PurchaseImportPreview,
  PurchaseImportConfirmResult,
} from "@/types/transaksi-pembelian/purchase-order-import";
import type { PurchaseOrderListParams } from "@/types/transaksi-pembelian/purchase-order";

export function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export function useImportPurchaseOrderPreview() {
  return useMutation<PurchaseImportPreview, Error, File>({
    mutationFn: (file: File) => PurchaseOrderService.previewImport(file),
  });
}

export function useImportPurchaseOrderConfirm() {
  const queryClient = useQueryClient();
  return useMutation<PurchaseImportConfirmResult, Error, { token: string }>({
    mutationFn: ({ token }) => PurchaseOrderService.confirmImport(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
}

export async function downloadPurchaseOrderTemplate() {
  const blob = await PurchaseOrderService.downloadImportTemplate();
  triggerBlobDownload(blob, "template-import-pesanan-pembelian.xlsx");
}

export async function downloadPurchaseOrderListExport(
  params?: PurchaseOrderListParams,
) {
  const blob = await PurchaseOrderService.exportList(params);
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `purchase-orders-list-${dateStr}.csv`);
}

export async function downloadPurchaseOrderExportDetail(
  params?: PurchaseOrderListParams,
) {
  const blob = await PurchaseOrderService.exportDetail(params);
  const dateStr = new Date().toISOString().slice(0, 10);
  triggerBlobDownload(blob, `purchase-orders-details-${dateStr}.csv`);
}
