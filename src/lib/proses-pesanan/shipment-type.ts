import type { ShipmentType } from "@/types/proses-pesanan/fulfillment";

/**
 * Cermin dari CourierMappingService::resolveShipmentType() di BE — dipakai
 * untuk menebak default "Tipe Pengiriman" dari nama kurir tanpa bergantung
 * pada field Courier.type (sudah dihapus, redundan dengan shipment_type).
 */
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
