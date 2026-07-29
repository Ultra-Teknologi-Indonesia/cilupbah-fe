export type DrillMetric = "on_hand" | "on_order" | "transit";

const ORDER_SOURCE_TOKENS =
  "ORDER_RESERVE,ORDER_RELEASE,RESERVE,RESERVE_CANCEL,RESERVE_EXPIRED";

export function buildStockDrillHref(
  itemId: string,
  metric: DrillMetric,
  locationId?: string,
): string {
  const p = new URLSearchParams();
  p.set("tab", "kronologi");

  if (metric === "on_order") {
    p.set("source", ORDER_SOURCE_TOKENS);
    p.set("drill", "order_active");
  }

  if (metric === "transit") p.set("drill", "transit");

  if (locationId) p.set("location_id", locationId);

  return `/dashboard/posisi-stok/${encodeURIComponent(itemId)}?${p.toString()}`;
}
