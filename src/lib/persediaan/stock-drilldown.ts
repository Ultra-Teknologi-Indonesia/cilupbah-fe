export type DrillMetric = "on_hand" | "on_order" | "reserved";

const METRIC_FILTER: Record<
  DrillMetric,
  { source?: string; direction?: "in" | "out" }
> = {
  on_hand: {},
  on_order: {
    source: "ORDER_SHIP,ORDER_RESTORE,ORDER_RESTORE_CANCEL",
    direction: "out",
  },
  reserved: {
    source: "INVOICE,ORDER_PICK",
  },
};

export function buildStockDrillHref(
  itemId: string,
  metric: DrillMetric,
  locationId?: string,
): string {
  const p = new URLSearchParams();
  p.set("tab", "kronologi");
  if (locationId) p.set("location_id", locationId);
  const cfg = METRIC_FILTER[metric];
  if (cfg.source) p.set("source", cfg.source);
  if (cfg.direction) p.set("direction", cfg.direction);
  return `/dashboard/posisi-stok/${encodeURIComponent(itemId)}?${p.toString()}`;
}
