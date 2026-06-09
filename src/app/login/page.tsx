import type { Metadata } from "next";

import { LoginScreen } from "@/components/auth/login-screen";

export const metadata: Metadata = {
  title: "Masuk · Cilupbah",
  description: "Masuk ke akun Cilupbah Anda.",
};

export default function LoginPage() {
  return <LoginScreen />;
}
