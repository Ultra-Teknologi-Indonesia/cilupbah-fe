import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { LiquidGlass } from "@/components/ui/liquid-glass";

export function LoginScreen() {
  return (
    <main
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden bg-background p-4 sm:p-6"
      style={{
        backgroundImage:
          "radial-gradient(at 0% 0%, color-mix(in oklch, var(--primary) 7%, transparent) 0px, transparent 55%), radial-gradient(at 100% 100%, color-mix(in oklch, var(--primary) 4%, transparent) 0px, transparent 55%)",
      }}
    >

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[20%] -left-[10%] h-[60%] w-[60%] rounded-full opacity-20 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "liquid-blob-1 12s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[0%] left-[20%] h-[55%] w-[55%] rounded-full opacity-15 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
            animation: "liquid-blob-3 18s ease-in-out infinite",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <LiquidGlass
          intensity="default"
          radius={32}
          className="bg-white/30 dark:bg-white/5"
        >
          <Card className="border-0 bg-transparent shadow-none ring-0">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <div className="liquid-glass-glow mb-5 grid size-14 place-items-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/60 to-white/10 shadow-lg backdrop-blur-md dark:border-white/10 dark:from-white/15 dark:to-white/0">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <CardTitle className="text-2xl tracking-tight">
                  Selamat datang kembali
                </CardTitle>
                <CardDescription className="mt-1.5 max-w-xs">
                  Masuk ke akun <span className="font-medium text-foreground/80">Cilupbah</span> untuk
                  melanjutkan.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <LoginForm />
            </CardContent>

          </Card>
        </LiquidGlass>
      </div>
    </main>
  );
}
