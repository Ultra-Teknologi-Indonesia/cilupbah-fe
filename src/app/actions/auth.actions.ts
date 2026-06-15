"use server";

import { cookies } from "next/headers";

export async function setLoginSession(token: string) {
  const cookieStore = await cookies();

  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearLoginSession() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
}
