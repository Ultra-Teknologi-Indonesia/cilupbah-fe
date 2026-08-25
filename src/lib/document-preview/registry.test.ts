import { describe, expect, it } from "vitest";
import { parseBulkDocumentIds } from "./registry";

describe("parseBulkDocumentIds", () => {
  it("parses plain comma-separated IDs", () => {
    expect(parseBulkDocumentIds("first,second")).toEqual(["first", "second"]);
  });

  it("parses URL-encoded commas from a document preview path", () => {
    expect(parseBulkDocumentIds("first%2Csecond%2Cthird")).toEqual([
      "first",
      "second",
      "third",
    ]);
  });

  it("does not throw for malformed URI input", () => {
    expect(parseBulkDocumentIds("first%2")).toEqual(["first%2"]);
  });
});
