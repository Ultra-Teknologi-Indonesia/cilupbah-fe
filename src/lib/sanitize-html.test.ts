import { describe, expect, it } from "vitest";

import { sanitizeHtml } from "@/lib/sanitize-html";

describe("sanitizeHtml", () => {
  it("mengembalikan string kosong untuk null/undefined/kosong", () => {
    expect(sanitizeHtml(null)).toBe("");
    expect(sanitizeHtml(undefined)).toBe("");
    expect(sanitizeHtml("")).toBe("");
  });

  it("membuang tag <script>", () => {
    const out = sanitizeHtml('<p>halo</p><script>alert(1)</script>');
    expect(out).toContain("halo");
    expect(out).not.toContain("<script");
    expect(out.toLowerCase()).not.toContain("alert(1)");
  });

  it("membuang handler event inline (onerror/onclick)", () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">');
    expect(out).not.toContain("onerror");
    expect(out.toLowerCase()).not.toContain("alert(1)");
  });

  it("membuang href javascript:", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">klik</a>');
    expect(out.toLowerCase()).not.toContain("javascript:");
  });

  it("mempertahankan markup deskripsi produk yang wajar", () => {
    const out = sanitizeHtml("<p><strong>Bahan:</strong> katun</p><ul><li>Adem</li></ul>");
    expect(out).toContain("<strong>");
    expect(out).toContain("<li>");
    expect(out).toContain("katun");
  });
});
