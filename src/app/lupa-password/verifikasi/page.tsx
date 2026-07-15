import type { Metadata } from "next";

import { VerifikasiOtpScreen } from "@/components/auth/verifikasi-otp-screen";

export const metadata: Metadata = {
  title: "Verifikasi Kode · Cilupbah",
  description: "Verifikasi kode reset kata sandi.",
};

export default function VerifikasiOtpPage() {
  return <VerifikasiOtpScreen />;
}
