import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export function ResetPasswordScreen() {
  return (
    <AuthShell
      title="Buat Kata Sandi Baru"
      description="Kata sandi baru harus memenuhi semua syarat keamanan berikut."
    >
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
