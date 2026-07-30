import type { Order } from "@/types/pesanan/order";

export const CANCELABLE_CHANNEL_STATUS: Record<string, string[]> = {
  shopee: ["UNPAID", "READY_TO_SHIP", "PROCESSED"],
  tiktok: ["UNPAID", "READY_TO_SHIP"],
  lazada: ["UNPAID", "PROCESSED"],
};

type CancelEligibleOrder = Pick<
  Order,
  | "source"
  | "channel_status"
  | "is_canceled"
  | "cancel_requested_at"
  | "channel_cancel_status"
>;

export function canRequestChannelCancel(order: CancelEligibleOrder): boolean {
  return (
    !!order.source &&
    order.source in CANCELABLE_CHANNEL_STATUS &&
    !order.is_canceled &&
    order.channel_cancel_status !== "pending" &&
    !order.cancel_requested_at &&
    !!order.channel_status &&
    CANCELABLE_CHANNEL_STATUS[order.source].includes(order.channel_status)
  );
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

/** Status yang dikirim ke endpoint cancel-reasons TikTok (samakan derivasi dengan BE). */
export function tiktokReasonStatus(order: {
  channel_status_raw: string | null;
  is_paid: boolean;
}): string {
  return order.channel_status_raw ?? (order.is_paid ? "ON_HOLD" : "UNPAID");
}
