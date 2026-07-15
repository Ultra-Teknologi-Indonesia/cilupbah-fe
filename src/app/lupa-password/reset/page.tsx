import type { Metadata } from "next";

import { ResetPasswordScreen } from "@/components/auth/reset-password-screen";

export const metadata: Metadata = {
  title: "Buat Kata Sandi Baru · Cilupbah",
  description: "Buat kata sandi baru untuk akun Cilupbah Anda.",
};

export default function ResetPasswordPage() {
  return <ResetPasswordScreen />;
}
