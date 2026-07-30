import type { Order } from "@/types/pesanan/order";

export const CANCELABLE_CHANNEL_STATUS: Record<string, string[]> = {
  shopee: ["UNPAID", "READY_TO_SHIP", "PROCESSED"],
  tiktok: ["UNPAID", "READY_TO_SHIP"],
  lazada: ["UNPAID", "PROCESSED"],
};

const PRE_SHIP_LOCAL = ["pending", "reserved", "picked", "packed"];

type CancelEligibleOrder = Pick<
  Order,
  | "source"
  | "status"
  | "channel_status"
  | "is_canceled"
  | "cancel_requested_at"
  | "channel_cancel_status"
>;

export function canRequestChannelCancel(order: CancelEligibleOrder): boolean {
  if (
    !order.source ||
    !(order.source in CANCELABLE_CHANNEL_STATUS) ||
    order.is_canceled ||
    order.channel_cancel_status === "pending" ||
    order.cancel_requested_at
  ) {
    return false;
  }

  const cs = order.channel_status;
  if (cs && CANCELABLE_CHANNEL_STATUS[order.source].includes(cs)) {
    return true;
  }

  // channel_status tak dikenal (UNKNOWN/kosong, mis. sync belum isi) -> andalkan
  // status LOKAL pra-kirim; channel API tetap otoritas final saat submit.
  if ((!cs || cs === "UNKNOWN") && PRE_SHIP_LOCAL.includes(order.status)) {
    return true;
  }

  return false;
}

/**
 * Kelompok status TikTok untuk pemilihan set alasan (samakan dengan BE).
 * Bila status mentah kosong, pakai is_paid: paid -> ON_HOLD (paid set), else unpaid.
 */
export function tiktokStatusGroup(
  raw: string | null,
  isPaid = false,
): "unpaid" | "paid" {
  if (raw) return raw.toUpperCase() === "UNPAID" ? "unpaid" : "paid";
  return isPaid ? "paid" : "unpaid";
}
