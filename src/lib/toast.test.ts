import { describe, expect, it } from "vitest";

import { getApiErrorPresentation } from "@/lib/toast";

describe("API error presentation", () => {
  it("keeps the safe backend message for 503 responses", () => {
    expect(
      getApiErrorPresentation({
        status: 503,
        title: "Layanan sementara tidak tersedia",
        message: "Server sedang padat. Silakan coba lagi beberapa saat.",
      }),
    ).toEqual({
      title: "Layanan sementara tidak tersedia",
      description: "Server sedang padat. Silakan coba lagi beberapa saat.",
    });
  });

  it("uses a safe Indonesian fallback for an empty 503 response", () => {
    expect(getApiErrorPresentation({ status: 503 })).toEqual({
      title: "Layanan sementara tidak tersedia",
      description: "Server sedang padat. Silakan coba lagi beberapa saat.",
    });
  });

  it("does not retry presentation details from a generic 500 response", () => {
    expect(
      getApiErrorPresentation({
        status: 500,
        message: "SQLSTATE[53300] internal database detail",
      }),
    ).toEqual({
      title: "Terjadi kesalahan server",
      description: "Silakan laporkan ke admin/developer terkait masalah ini.",
    });
  });

  it("shows the support reference for a tracked 500 response", () => {
    expect(
      getApiErrorPresentation({
        status: 500,
        request_id: "8c4f1e2a-7a2c-4c9d-91f5-1f0e8f7c3a10",
      }),
    ).toEqual({
      title: "Terjadi kesalahan server",
      description:
        "Silakan laporkan ke admin/developer terkait masalah ini. Kode laporan: 8c4f1e2a-7a2c-4c9d-91f5-1f0e8f7c3a10",
    });
  });
});
