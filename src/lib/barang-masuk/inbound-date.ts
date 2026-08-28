import { formatDateTimeWib, formatDateTime } from "@/lib/format";
import type { Inbound } from "@/types/barang-masuk/inbound";

/**
 * expected_date is a calendar date for normal inbound records, while
 * TRANSIT_IN keeps the transfer departure time and must retain its time.
 */
export function formatInboundExpectedDate(
  inbound: Pick<Inbound, "type" | "expected_date" | "created_at">,
): string {
  if (!inbound.expected_date) return formatDateTime(inbound.created_at);

  return inbound.type === "TRANSIT_IN"
    ? formatDateTime(inbound.expected_date)
    : formatDateTimeWib(inbound.expected_date);
}
