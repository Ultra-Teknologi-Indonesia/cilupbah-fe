import { Suspense } from "react";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export function LoginScreen() {
  return (
    <AuthShell
      title="Selamat datang kembali"
      description={
        <>
          Masuk ke akun{" "}
          <span className="font-medium text-foreground/80">Cilupbah</span> untuk
          melanjutkan.
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
