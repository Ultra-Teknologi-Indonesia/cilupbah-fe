import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/auth/token-refresh";

export async function POST() {
  const result = await refreshSession();

  if (result.status === "retryable") {
    return NextResponse.json(
      {
        code: "REFRESH_UNAVAILABLE",
        message: "Server sedang sibuk menyegarkan sesi Anda.",
      },
      { status: 503 },
    );
  }

  if (result.status !== "ok") {
    return NextResponse.json(
      { code: "SESSION_EXPIRED", message: "Sesi Anda telah berakhir." },
      { status: 401 },
    );
  }

  return NextResponse.json({ status: "success" });
}
