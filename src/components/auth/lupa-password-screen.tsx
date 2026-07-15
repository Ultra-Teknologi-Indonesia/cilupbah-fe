import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LupaPasswordForm } from "@/components/auth/lupa-password-form";

export function LupaPasswordScreen() {
  return (
    <AuthShell
      title="Lupa Kata Sandi"
      description="Masukkan email akun Anda. Kami akan mengirim kode verifikasi jika email tersebut terdaftar."
    >
      <Suspense>
        <LupaPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
