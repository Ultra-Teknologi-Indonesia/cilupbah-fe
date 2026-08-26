import { describe, expect, it } from "vitest";

import {
  BULK_LABEL_STATUS_POLL_INTERVAL_MS,
  bulkLabelRefetchInterval,
} from "./bulk-label-polling";

describe("bulk label status polling", () => {
  it("polls only while the batch is processing", () => {
    expect(bulkLabelRefetchInterval("processing")).toBe(
      BULK_LABEL_STATUS_POLL_INTERVAL_MS,
    );
    expect(bulkLabelRefetchInterval("ready")).toBe(false);
    expect(bulkLabelRefetchInterval("failed")).toBe(false);
    expect(bulkLabelRefetchInterval(undefined)).toBe(false);
  });
});
