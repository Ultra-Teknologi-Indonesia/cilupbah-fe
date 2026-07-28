"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { useMe, useUnlock } from "@/hooks/auth/use-auth";
import {
  MAX_UNLOCK_ATTEMPTS,
  useIdleLock,
  useIdleLockStore,
} from "@/hooks/auth/use-idle-lock";
import { clearLoginSession } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const PROTECTED_PREFIXES = ["/dashboard"];

async function forceLogout() {
  try {
    await clearLoginSession();
  } catch {}
  window.location.href = "/login";
}

export function IdleLockDialog() {
  const pathname = usePathname();
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname?.startsWith(p));

  const { data: me } = useMe();
  const enabled = isProtected && Boolean(me);

  const locked = useIdleLock(enabled);

  if (!enabled || !locked) return null;

  return <IdleLockPrompt email={me?.email} />;
}

function IdleLockPrompt({ email }: { email?: string }) {
  const unlockScreen = useIdleLockStore((s) => s.unlock);
  const queryClient = useQueryClient();
  const unlock = useUnlock();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (unlock.isPending || !password) return;

    setError(null);

    try {
      await unlock.mutateAsync(password);
      unlockScreen();

      queryClient.invalidateQueries();
    } catch (err) {
      const status = (err as { status?: number })?.status;
      const code = (err as { code?: string })?.code;

      if (status === 401 || code === "SESSION_EXPIRED") {
        await forceLogout();
        return;
      }

      setPassword("");

      if (status === 429) {
        setError("Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.");
        return;
      }

      const next = attempts + 1;
      setAttempts(next);

      if (next >= MAX_UNLOCK_ATTEMPTS) {
        await forceLogout();
        return;
      }

      setError(
        `Kata sandi salah. Sisa ${MAX_UNLOCK_ATTEMPTS - next} percobaan.`,
      );
    }
  };

  return (
    <Dialog open>
      <DialogContent
        showCloseButton={false}
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        className="sm:max-w-md"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Aplikasi tidak aktif</DialogTitle>
            <DialogDescription>
              Silahkan masukkan kembali password
              {email ? ` untuk ${email}` : ""}.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 space-y-2">
            <PasswordInput
              showIcon={false}
              autoFocus
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={unlock.isPending}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={forceLogout}
              disabled={unlock.isPending}
            >
              Keluar
            </Button>
            <Button type="submit" disabled={unlock.isPending || !password}>
              {unlock.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Memeriksa...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
