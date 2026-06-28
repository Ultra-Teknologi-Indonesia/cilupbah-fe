"use client"

import { useQuery } from "@tanstack/react-query"
import { PurchaseOrderService } from "@/services/transaksi-pembelian/purchase-order.service"
import type { PurchaseOrderListParams } from "@/types/transaksi-pembelian/purchase-order"

const STALE = 30 * 1000

export function useReceivablePurchaseOrders(params: PurchaseOrderListParams = {}) {
  return useQuery({
    queryKey: ["purchase-order", "list", { ...params, receivable: true }],
    queryFn: () => PurchaseOrderService.list(params),
    staleTime: STALE,
  })
}
