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
  const normalized = lower.replace(/[\s_-]+/g, " ");
  if (normalized.includes("next day") || normalized.includes("nextday")) {
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

function formatShipmentNoDate(
  shipmentNo: string | null | undefined,
  fallbackDate: string | null | undefined,
): string {
  const embeddedDate = shipmentNo?.match(/\b\d{2}-\d{2}-\d{4}\b/)?.[0];
  return embeddedDate ?? formatDateDMY(fallbackDate);
}

export function formatShipmentLabel(
  s: Pick<
    Shipment,
    | "shipmentType"
    | "shipmentDate"
    | "shipmentNo"
    | "hasInstant"
    | "courierCode"
    | "courierName"
  >,
): string {
  const type = (s.shipmentType ?? "REGULAR") as ShipmentType;
  const isInstantOrSameDay =
    s.hasInstant || type === "INSTANT" || type === "SAME_DAY";
  const courierCode = s.courierCode?.trim().toLowerCase();
  const base = isInstantOrSameDay
    ? "INSTAN & SAMEDAY"
    : courierCode === "lex"
      ? "LAZADA"
      : s.courierName?.trim() || SHIPMENT_TYPE_UPPER_LABEL[type] || "REGULER";
  const date = formatShipmentNoDate(s.shipmentNo, s.shipmentDate);

  if (!date) return base;
  return isInstantOrSameDay || courierCode === "lex"
    ? `${base} (${date})`
    : `${base} ${date}`;
}
