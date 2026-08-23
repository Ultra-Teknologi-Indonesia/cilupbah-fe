import type {
  Shipment,
  ShipmentType,
} from "@/types/proses-pesanan/fulfillment";

export function guessShipmentTypeFromCourierName(name: string): ShipmentType {
  const lower = name.trim().toLowerCase();

  if (
    lower.includes("instant") ||
    lower.includes("instan") ||
    lower.includes("sameday") ||
    lower.includes("same day") ||
    lower.includes("same-day")
  ) {
    return "INSTANT";
  }
  if (lower.includes("next day") || lower.includes("nextday")) {
    return "EXPRESS";
  }
  if (
    lower.includes("cargo") ||
    lower.includes("trucking") ||
    lower.includes("kargo")
  ) {
    return "CARGO";
  }
  return "REGULAR";
}

const SHIPMENT_TYPE_UPPER_LABEL: Record<ShipmentType, string> = {
  REGULAR: "REGULER",
  EXPRESS: "EXPRESS",
  SAME_DAY: "SAMEDAY",
  CARGO: "KARGO",
  INSTANT: "INSTAN",
};

function formatDateDMY(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

export function formatShipmentLabel(
  s: Pick<
    Shipment,
    "shipmentType" | "shipmentDate" | "shipmentNo" | "hasInstant"
  >,
): string {
  const type = (s.shipmentType ?? "REGULAR") as ShipmentType;
  const isInstantOrSameDay =
    s.hasInstant || type === "INSTANT" || type === "SAME_DAY";
  const base = isInstantOrSameDay
    ? "INSTAN & SAMEDAY"
    : (SHIPMENT_TYPE_UPPER_LABEL[type] ?? "REGULER");
  const date = formatDateDMY(s.shipmentDate);
  return date ? `${base} (${date})` : base;
}
