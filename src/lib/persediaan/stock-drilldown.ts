export type DrillMetric = "on_hand" | "on_order" | "transit";

const DRILL_SCOPE: Partial<Record<DrillMetric, string>> = {
  on_order: "allocation",
  transit: "transit",
};

export function buildStockDrillHref(
  itemId: string,
  metric: DrillMetric,
  locationId?: string,
): string {
  const p = new URLSearchParams();
  p.set("tab", "kronologi");

  const scope = DRILL_SCOPE[metric];
  if (scope) p.set("drill", scope);
  if (locationId) p.set("location_id", locationId);

  return `/dashboard/posisi-stok/${encodeURIComponent(itemId)}?${p.toString()}`;
}
