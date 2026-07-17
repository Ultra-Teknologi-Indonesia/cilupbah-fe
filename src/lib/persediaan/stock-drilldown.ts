export type DrillMetric = "on_hand" | "on_order" | "transit";

const TRANSIT_SOURCES = [
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "BIN_TRANSFER_IN",
  "BIN_TRANSFER_OUT",
].join(",");

export function buildStockDrillHref(
  itemId: string,
  metric: DrillMetric,
  locationId?: string,
): string {
  const p = new URLSearchParams();
  switch (metric) {
    case "on_hand":
      p.set("tab", "kronologi");
      if (locationId) p.set("location_id", locationId);
      break;
    case "on_order":
      p.set("tab", "pesanan");
      if (locationId) p.set("location_id", locationId);
      break;
    case "transit":
      p.set("tab", "kronologi");
      p.set("source", TRANSIT_SOURCES);
      if (locationId) p.set("location_id", locationId);
      break;
  }
  return `/dashboard/posisi-stok/${encodeURIComponent(itemId)}?${p.toString()}`;
}
