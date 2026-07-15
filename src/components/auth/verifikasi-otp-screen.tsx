import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifikasiOtpForm } from "@/components/auth/verifikasi-otp-form";

export function VerifikasiOtpScreen() {
  return (
    <AuthShell
      title="Verifikasi Kode"
      description="Masukkan 6 digit kode verifikasi yang kami kirim ke email Anda. Kode berlaku 10 menit."
    >
      <Suspense>
        <VerifikasiOtpForm />
      </Suspense>
    </AuthShell>
  );
}
