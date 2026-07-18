import { NextResponse } from "next/server";

import { refreshSession } from "@/lib/auth/token-refresh";

/**
 * Corong tunggal untuk semua penyegaran token.
 *
 * proxy.ts memuat modul di instance terpisah dari Route Handler, jadi Map
 * single-flight di token-refresh.ts tidak menyatu kalau keduanya sama-sama
 * mengimpornya. Karena itu proxy.ts memanggil endpoint ini lewat HTTP —
 * semua refresh akhirnya melewati satu instance modul yang sama.
 */
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
