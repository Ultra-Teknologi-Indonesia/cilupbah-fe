import { describe, expect, it } from "vitest";

import { formatInboundExpectedDate } from "@/lib/barang-masuk/inbound-date";

describe("formatInboundExpectedDate", () => {
  it("formats sales returns with the WIB timestamp", () => {
    expect(
      formatInboundExpectedDate({
        type: "SALES_RETURN",
        expected_date: "2026-08-25T00:00:00.000000Z",
        created_at: "2026-08-25T07:31:17.000000Z",
      }),
    ).toBe("25 Agu 2026, 07.00 WIB");
  });

  it("keeps the departure time for transit inbound records", () => {
    expect(
      formatInboundExpectedDate({
        type: "TRANSIT_IN",
        expected_date: "2026-08-25T04:24:36.000000Z",
        created_at: "2026-08-25T04:24:36.000000Z",
      }),
    ).toBe("25 Agu 2026, 11.24");
  });
});
