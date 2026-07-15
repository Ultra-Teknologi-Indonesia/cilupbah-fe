import type { Metadata } from "next";

import { LupaPasswordScreen } from "@/components/auth/lupa-password-screen";

export const metadata: Metadata = {
  title: "Lupa Kata Sandi · Cilupbah",
  description: "Reset kata sandi akun Cilupbah Anda.",
};

export default function LupaPasswordPage() {
  return <LupaPasswordScreen />;
}
