export type DrillMetric = "on_hand" | "on_order" | "transit";

export function buildStockDrillHref(
  itemId: string,
  metric: DrillMetric,
  locationId?: string,
): string {
  const p = new URLSearchParams();
  p.set("tab", "kronologi");

  // On Order memakai nama kategori BE (`ORDER`) supaya bentuk URL-nya sejajar
  // dengan Jubelio (?source=ORDER) -- acuan yang dipakai klien saat
  // membandingkan kedua sistem. Isi kategorinya dimiliki BE.
  if (metric === "on_order") p.set("source", "ORDER");

  // Transit tetap lewat `drill`: TRANSIT_IN/OUT adalah sebagian dari kategori
  // TRANSFER, bukan kategori utuh, jadi tak bisa diwakili satu nama kategori.
  if (metric === "transit") p.set("drill", "transit");

  if (locationId) p.set("location_id", locationId);

  return `/dashboard/posisi-stok/${encodeURIComponent(itemId)}?${p.toString()}`;
}
