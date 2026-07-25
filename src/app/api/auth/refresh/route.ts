import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/auth/token-refresh";

export async function POST() {
  const pair = await refreshSession();

  if (!pair) {
    return NextResponse.json(
      { code: "SESSION_EXPIRED", message: "Sesi Anda telah berakhir." },
      { status: 401 },
    );
  }

  return NextResponse.json({ status: "success" });
}
