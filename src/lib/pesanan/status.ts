import type { Order } from "@/types/pesanan/order";

export function getOrderStatusBadgeStatus(
  order: Pick<Order, "status" | "wms_status" | "has_stock_shortfall">,
): string {
  if (order.status === "reserved" && order.has_stock_shortfall) {
    return "empty-stock";
  }

  return order.wms_status || order.status;
}
