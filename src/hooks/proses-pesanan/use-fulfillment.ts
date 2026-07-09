"use client";

import { useCallback } from "react";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { createMutationHook } from "@/hooks/create-crud-hooks";
import { toast } from "sonner";

import {
  OutboundService,
  type CreateShipmentPayload,
} from "@/services/proses-pesanan/outbound.service";
import type {
  FulfillmentListParams,
  PicklistDetail,
  PacklistDetail,
} from "@/types/proses-pesanan/fulfillment";

const STALE = 30_000;
const all = ["proses-pesanan"] as const;

const board = [...all, "board"] as const;

export const fulfillmentKeys = {
  all,
  board,
  ordersByStage: (stage: string, p: FulfillmentListParams) =>
    [...board, "orders", stage, p] as const,
  picklists: (p: FulfillmentListParams) => [...board, "picklists", p] as const,
  packlists: (p: FulfillmentListParams) => [...board, "packlists", p] as const,
  shipments: (p: FulfillmentListParams) => [...board, "shipments", p] as const,
  count: (key: string) => [...board, "count", key] as const,
  pickers: (locationId?: string, role?: string) =>
    [...all, "pickers", locationId ?? "", role ?? ""] as const,
  picklistDetail: (id: string) => [...all, "picklist-detail", id] as const,
  packlistDetail: (id: string) => [...all, "packlist-detail", id] as const,
  shipmentDetail: (id: string) => [...all, "shipment-detail", id] as const,
  shipmentOrders: (id: string, p: FulfillmentListParams) =>
    [...all, "shipment-orders", id, p] as const,
};

export function useOrdersByStage(
  stage: string,
  params: FulfillmentListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: fulfillmentKeys.ordersByStage(stage, params),
    queryFn: () => OutboundService.ordersByStage(stage, params),
    staleTime: STALE,
    enabled,
  });
}

export function usePicklists(params: FulfillmentListParams, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.picklists(params),
    queryFn: () => OutboundService.picklists(params),
    staleTime: STALE,
    enabled,
  });
}

export function usePacklists(params: FulfillmentListParams, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.packlists(params),
    queryFn: () => OutboundService.packlists(params),
    staleTime: STALE,
    enabled,
  });
}

export function useShipments(params: FulfillmentListParams, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.shipments(params),
    queryFn: () => OutboundService.shipments(params),
    staleTime: STALE,
    enabled,
  });
}

export function usePickers(locationId?: string, role?: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.pickers(locationId, role),
    queryFn: () => OutboundService.pickers(locationId, role),
    staleTime: 60_000,
    enabled,
  });
}

export function useCouriers(enabled = true) {
  return useQuery({
    queryKey: [...all, "couriers"],
    queryFn: () => OutboundService.couriersAll(),
    staleTime: 5 * 60_000,
    enabled,
  });
}

export function usePickingCounts() {
  const belum = useQuery({
    queryKey: fulfillmentKeys.count("picking-belum"),
    queryFn: () =>
      OutboundService.ordersByStage("ready-to-process", { per_page: 1 }).then(
        (r) => r.meta.total,
      ),
    staleTime: STALE,
  });
  const diproses = useQuery({
    queryKey: fulfillmentKeys.count("picking-diproses"),
    queryFn: () =>
      OutboundService.picklists({
        per_page: 1,
        status: "DRAFT,IN_PROGRESS",
      }).then((r) => r.meta.total),
    staleTime: STALE,
  });
  const selesai = useQuery({
    queryKey: fulfillmentKeys.count("picking-selesai"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pick", { per_page: 1 }).then(
        (r) => r.meta.total,
      ),
    staleTime: STALE,
  });
  return {
    belum: belum.data,
    diproses: diproses.data,
    selesai: selesai.data,
  };
}

export function usePackingCounts() {
  const belum = useQuery({
    queryKey: fulfillmentKeys.count("packing-belum"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pick", { per_page: 1 }).then(
        (r) => r.meta.total,
      ),
    staleTime: STALE,
  });
  const diproses = useQuery({
    queryKey: fulfillmentKeys.count("packing-diproses"),
    queryFn: () =>
      OutboundService.packlists({
        per_page: 1,
        status: "DRAFT,IN_PROGRESS",
      }).then((r) => r.meta.total),
    staleTime: STALE,
  });
  const selesai = useQuery({
    queryKey: fulfillmentKeys.count("packing-selesai"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pack", { per_page: 1 }).then(
        (r) => r.meta.total,
      ),
    staleTime: STALE,
  });
  return {
    belum: belum.data,
    diproses: diproses.data,
    selesai: selesai.data,
  };
}

export const useCreatePicklist = createMutationHook({
  mutationFn: (payload: {
    order_ids: string[];
    location_id: string;
    picker_id: string;
    notes?: string | null;
  }) => OutboundService.createPicklist(payload),
  silentError: true,
  invalidates: () => [fulfillmentKeys.board],
});

export const useAssignPicker = createMutationHook({
  mutationFn: ({
    picklistId,
    pickerId,
  }: {
    picklistId: string;
    pickerId: string;
  }) => OutboundService.assignPicker(picklistId, pickerId),
  silentError: true,
  invalidates: () => [fulfillmentKeys.board],
});

export const useAssignPacker = createMutationHook({
  mutationFn: ({
    packlistId,
    packerId,
  }: {
    packlistId: string;
    packerId: string;
  }) => OutboundService.assignPacker(packlistId, packerId),
  silentError: true,
  invalidates: () => [fulfillmentKeys.board],
});

export const useReadyToShip = createMutationHook({
  mutationFn: (orderIds: string[]) => OutboundService.readyToShip(orderIds),
  silentError: true,
  invalidates: () => [fulfillmentKeys.board],
});

export const useRetryPickup = createMutationHook({
  mutationFn: (orderIds: string[]) => OutboundService.retryPickup(orderIds),
  silentError: true,
  invalidates: () => [fulfillmentKeys.board],
});

export const useStartPicklist = createMutationHook({
  mutationFn: (id: string) => OutboundService.startPicklist(id),
  silentError: true,
  invalidates: (id) => [
    fulfillmentKeys.board,
    fulfillmentKeys.picklistDetail(id),
  ],
});

export function usePicklistDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.picklistDetail(id),
    queryFn: () => OutboundService.picklistDetail(id),
    enabled: enabled && !!id,
  });
}

export function usePrefetchPicklistDetail() {
  const qc = useQueryClient();
  return useCallback(
    (id: string) => {
      qc.prefetchQuery({
        queryKey: fulfillmentKeys.picklistDetail(id),
        queryFn: () => OutboundService.picklistDetail(id),
      });
    },
    [qc],
  );
}

export function usePrefetchPacklistDetail() {
  const qc = useQueryClient();
  return useCallback(
    (id: string) => {
      qc.prefetchQuery({
        queryKey: fulfillmentKeys.packlistDetail(id),
        queryFn: () => OutboundService.packlistDetail(id),
      });
    },
    [qc],
  );
}

export function usePickItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      picklistId,
      itemId,
      qtyPicked,
      binCode,
    }: {
      picklistId: string;
      itemId: string;
      qtyPicked: number;
      binCode: string;
    }) =>
      OutboundService.pickItem(picklistId, itemId, {
        qty_picked: qtyPicked,
        bin_code: binCode,
      }),

    onMutate: async (v) => {
      const key = fulfillmentKeys.picklistDetail(v.picklistId);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<PicklistDetail>(key);
      if (prev) {
        qc.setQueryData<PicklistDetail>(key, {
          ...prev,
          items: prev.items.map((it) =>
            it.id === v.itemId
              ? {
                  ...it,
                  qtyPicked: v.qtyPicked,
                  binCode: v.binCode || it.binCode,
                }
              : it,
          ),
        });
      }
      return { key, prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_d, _e, v) =>
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.picklistDetail(v.picklistId),
      }),
  });
}

export function useUnpickItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      picklistId,
      itemId,
      qty,
    }: {
      picklistId: string;
      itemId: string;
      qty?: number;
    }) => OutboundService.unpickItem(picklistId, itemId, qty),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.picklistDetail(v.picklistId),
      });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function useScanForPick() {
  return useMutation({
    mutationFn: ({
      picklistId,
      sku,
      binCode,
      hintActiveBinCode,
    }: {
      picklistId: string;
      sku: string;
      binCode?: string | null;
      hintActiveBinCode?: string | null;
    }) =>
      OutboundService.scanForPick(picklistId, {
        sku,
        bin_code: binCode ?? null,
        hint_active_bin_code: hintActiveBinCode ?? null,
      }),
  });
}

export function useCompletePicklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OutboundService.completePicklist(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(id) });
    },
  });
}

export function useDownloadPicklistPdf() {
  return useMutation({
    mutationFn: async ({
      picklistId,
      picklistNo,
    }: {
      picklistId: string;
      picklistNo?: string | null;
    }) => {
      const blob = await OutboundService.picklistPdf(picklistId);
      const filename = picklistNo
        ? `${picklistNo}.pdf`
        : `PICK-${picklistId}.pdf`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return filename;
    },
    onSuccess: (filename) => {
      toast.success(`Picklist ${filename} berhasil diunduh`);
    },
    onError: (err: unknown) => {
      const msg =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Gagal mengunduh PDF picklist.";
      toast.error(msg);
    },
  });
}

export function useAdHocPick() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      order_id: string;
      items?: Array<{
        order_item_id: string;
        qty_picked: number;
        bin_id?: string | null;
      }>;
    }) => OutboundService.adHocPick(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  });
}

export function useGetOrderByNo() {
  return useMutation({
    mutationFn: (orderNo: string) => OutboundService.getOrderByNo(orderNo),
  });
}

export function useAdHocPickScan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      order_id: string;
      sku: string;
      qty?: number;
      bin_id?: string | null;
    }) => OutboundService.adHocPickScan(payload),
    onSuccess: (_d, _v) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function useFailPicklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      OutboundService.failPicklist(id, reason),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.picklistDetail(v.id) });
    },
  });
}

export function useRevertPicklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OutboundService.revertPicklist(id),
    onSuccess: () => {
      // Order anggota kembali ke queue sebelumnya — invalidate seluruh board.
      qc.invalidateQueries({ queryKey: fulfillmentKeys.all });
    },
  });
}

export function useFailPickItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      picklistId,
      itemId,
      reasonCode,
      reasonNote,
    }: {
      picklistId: string;
      itemId: string;
      reasonCode: string;
      reasonNote?: string | null;
    }) =>
      OutboundService.failPickItem(picklistId, itemId, {
        reasonCode,
        reasonNote: reasonNote ?? null,
      }),
    onSuccess: (_d, v) => {
      toast.success("Item ditandai gagal.");
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.picklistDetail(v.picklistId),
      });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function useUnfailPickItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      picklistId,
      itemId,
    }: {
      picklistId: string;
      itemId: string;
    }) => OutboundService.unfailPickItem(picklistId, itemId),
    onSuccess: (_d, v) => {
      toast.success("Tanda gagal item dibatalkan.");
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.picklistDetail(v.picklistId),
      });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function useSplitPickItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      picklistId,
      itemId,
      allocations,
    }: {
      picklistId: string;
      itemId: string;
      allocations: Array<{ binCode: string; qty: number }>;
    }) =>
      OutboundService.splitPickItem(picklistId, itemId, { allocations }),
    onSuccess: (_d, v) => {
      toast.success("Item berhasil di-pick lintas rak.");
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.picklistDetail(v.picklistId),
      });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function useScanOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderNo,
      packerId,
    }: {
      orderNo: string;
      packerId?: string | null;
    }) => OutboundService.scanOrder(orderNo, packerId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  });
}

export function usePacklistDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.packlistDetail(id),
    queryFn: () => OutboundService.packlistDetail(id),
    enabled: enabled && !!id,
  });
}

/**
 * Fetch several packlist details in parallel — used by the multi-order packing
 * station where one session spans multiple scanned orders/packlists.
 */
export function usePacklistDetails(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: fulfillmentKeys.packlistDetail(id),
      queryFn: () => OutboundService.packlistDetail(id),
      enabled: !!id,
    })),
  });
}

export function useStartPacklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OutboundService.startPacklist(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.packlistDetail(id) });
    },
  });
}

export function useVerifyBarcode() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      packlistId,
      barcode,
    }: {
      packlistId: string;
      barcode: string;
    }) => OutboundService.verifyBarcode(packlistId, barcode),
    onSuccess: (_d, v) =>
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.packlistDetail(v.packlistId),
      }),
  });
}

export function useUnpackItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      packlistId,
      itemId,
      qty,
    }: {
      packlistId: string;
      itemId: string;
      qty?: number;
    }) => OutboundService.unpackItem(packlistId, itemId, qty),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.packlistDetail(v.packlistId),
      });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function usePackItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      packlistId,
      itemId,
      qtyPacked,
      barcodeVerified,
    }: {
      packlistId: string;
      itemId: string;
      qtyPacked: number;
      barcodeVerified?: boolean;
    }) =>
      OutboundService.packItem(packlistId, itemId, {
        qty_packed: qtyPacked,
        barcode_verified: barcodeVerified,
      }),

    onMutate: async (v) => {
      const key = fulfillmentKeys.packlistDetail(v.packlistId);
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<PacklistDetail>(key);
      if (prev) {
        qc.setQueryData<PacklistDetail>(key, {
          ...prev,
          items: prev.items.map((it) =>
            it.id === v.itemId
              ? {
                  ...it,
                  qtyPacked: v.qtyPacked,
                  barcodeVerified: v.barcodeVerified ?? it.barcodeVerified,
                }
              : it,
          ),
        });
      }
      return { key, prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },
    onSettled: (_d, _e, v) =>
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.packlistDetail(v.packlistId),
      }),
  });
}

export function useCompletePacklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => OutboundService.completePacklist(id),
    onSuccess: (_d, id) => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.packlistDetail(id) });
    },
  });
}

export function useMarkComplete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderIds: string[]) => OutboundService.markComplete(orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  });
}

export function useCreateShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      orderIds,
    }: {
      payload: CreateShipmentPayload;
      orderIds: string[];
    }) => OutboundService.createShipmentWithOrders(payload, orderIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  });
}

export function useHandOverShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) =>
      OutboundService.handOverShipment(shipmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  });
}

export function useCancelShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (shipmentId: string) =>
      OutboundService.cancelShipment(shipmentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: fulfillmentKeys.board }),
  });
}

export function useShipmentDetail(id: string, enabled = true) {
  return useQuery({
    queryKey: fulfillmentKeys.shipmentDetail(id),
    queryFn: () => OutboundService.shipmentDetail(id),
    enabled: enabled && !!id,
  });
}

export function useShipmentOrdersPaginated(
  id: string,
  params: FulfillmentListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: fulfillmentKeys.shipmentOrders(id, params),
    queryFn: () => OutboundService.shipmentOrdersPaginated(id, params),
    enabled: enabled && !!id,
  });
}

export function useScanOrderToShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      barcode,
    }: {
      shipmentId: string;
      barcode: string;
    }) => OutboundService.scanOrderToShipment(shipmentId, barcode),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.shipmentDetail(v.shipmentId),
      });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function useRemoveOrderFromShipment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      shipmentId,
      orderIds,
    }: {
      shipmentId: string;
      orderIds: string[];
    }) => OutboundService.removeOrderFromShipment(shipmentId, orderIds),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.shipmentDetail(v.shipmentId),
      });
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
    },
  });
}

export function useDeleteFulfillmentOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, reason }: { orderId: string; reason?: string }) =>
      OutboundService.deleteFulfillmentOrder(orderId, reason),
    onSuccess: () => {
      // Hapus pesanan memengaruhi semua tampilan: orders-by-stage, picklist,
      // packlist, shipment (list + detail) dan counts — invalidate root key.
      qc.invalidateQueries({ queryKey: fulfillmentKeys.all });
    },
  });
}

export function usePreManifestCancelCount() {
  return useQuery({
    queryKey: fulfillmentKeys.count("pre-manifest-cancel"),
    queryFn: () => OutboundService.preManifestCancelCount(),
    staleTime: STALE,
  });
}

export function useDismissPreManifestCancel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      OutboundService.preManifestCancelDismiss(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.count("pre-manifest-cancel"),
      });
    },
  });
}

export function useUndismissPreManifestCancel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) =>
      OutboundService.preManifestCancelUndismiss(orderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fulfillmentKeys.board });
      qc.invalidateQueries({
        queryKey: fulfillmentKeys.count("pre-manifest-cancel"),
      });
    },
  });
}

export function useDownloadPreManifestCancelXlsx() {
  return useMutation({
    mutationFn: async (opts?: {
      date_from?: string | null;
      date_to?: string | null;
    }) => {
      const blob = await OutboundService.preManifestCancelExport(opts);
      const today = new Date().toISOString().slice(0, 10);
      const from = opts?.date_from ?? today;
      const to = opts?.date_to ?? today;
      const filename = `cancel-pasca-packing-${from}-${to}.xlsx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return filename;
    },
    onSuccess: (filename) => {
      toast.success(`${filename} berhasil diunduh.`);
    },
    onError: (err: unknown) => {
      const msg =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Gagal mengunduh XLSX cancel.";
      toast.error(msg);
    },
  });
}

export function usePreManifestCancelList(params: import("@/types/proses-pesanan/fulfillment").FulfillmentListParams) {
  return useQuery({
    queryKey: [...fulfillmentKeys.board, "pre-manifest-cancel-list", params],
    queryFn: () => OutboundService.preManifestCancelList(params),
    staleTime: STALE,
  });
}

export function useShippingCounts() {
  const siapKirim = useQuery({
    queryKey: fulfillmentKeys.count("shipping-siap-kirim"),
    queryFn: () =>
      OutboundService.ordersByStage("finish-pack", { per_page: 1 }).then(
        (r) => r.meta.total,
      ),
    staleTime: STALE,
  });
  const jadwal = useQuery({
    queryKey: fulfillmentKeys.count("shipping-jadwal"),
    queryFn: () =>
      OutboundService.shipments({ status: "SCHEDULED", per_page: 1 }).then(
        (r) => r.meta.total,
      ),
    staleTime: STALE,
  });
  const batal = useQuery({
    queryKey: fulfillmentKeys.count("pre-manifest-cancel"),
    queryFn: () => OutboundService.preManifestCancelCount(),
    staleTime: STALE,
  });
  return {
    "siap-kirim": siapKirim.data,
    jadwal: jadwal.data,
    batal: batal.data,
  };
}
