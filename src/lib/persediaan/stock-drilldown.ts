export type DrillMetric = "on_hand" | "on_order" | "transit";

export function buildStockDrillHref(
  itemId: string,
  metric: DrillMetric,
  locationId?: string,
): string {
  const p = new URLSearchParams();

  if (metric === "on_order") {
    p.set("tab", "pesanan");
    if (locationId) p.set("location_id", locationId);
    return `/dashboard/posisi-stok/${encodeURIComponent(itemId)}?${p.toString()}`;
  }

  p.set("tab", "kronologi");

  if (metric === "transit") p.set("drill", "transit");

  if (locationId) p.set("location_id", locationId);

  return `/dashboard/posisi-stok/${encodeURIComponent(itemId)}?${p.toString()}`;
}
