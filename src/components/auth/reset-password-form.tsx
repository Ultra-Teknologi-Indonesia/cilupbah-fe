"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import { useResetPassword } from "@/hooks/auth/use-auth";
import { apiError, apiSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  clearResetFlow,
  readResetFlow,
  type ResetFlowState,
} from "@/lib/reset-flow-storage";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/schemas/auth/reset-password.schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/auth/password-input";
import {
  isPasswordStrong,
  PasswordStrength,
} from "@/components/auth/password-strength";

export function ResetPasswordForm({ className }: { className?: string }) {
  const router = useRouter();
  const [flow, setFlow] = useState<ResetFlowState | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const state = readResetFlow();
    if (!state) {
      router.replace("/lupa-password");
      return;
    }
    setFlow(state);
    setChecked(true);
  }, [router]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", password_confirmation: "" },
    mode: "onTouched",
  });

  const mutation = useResetPassword();
  const passwordValue = form.watch("password");
  const confirmValue = form.watch("password_confirmation");

  const onSubmit = (values: ResetPasswordValues) => {
    if (!flow) return;
    mutation.mutate(
      {
        email: flow.email,
        reset_token: flow.reset_token,
        password: values.password,
        password_confirmation: values.password_confirmation,
      },
      {
        onSuccess: (res) => {
          clearResetFlow();
          apiSuccess(res, "Kata sandi berhasil diubah");
          router.push("/login");
        },
        onError: (error) => apiError(error, "Gagal mengubah kata sandi"),
      },
    );
  };

  if (!checked) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canSubmit =
    isPasswordStrong(passwordValue) &&
    passwordValue === confirmValue &&
    confirmValue.length > 0;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-5", className)}
        noValidate
      >
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground/70">
                Kata sandi baru
              </FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Kata sandi baru"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <PasswordStrength password={passwordValue} />

        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground/70">
                Konfirmasi kata sandi baru
              </FormLabel>
              <FormControl>
                <PasswordInput
                  autoComplete="new-password"
                  placeholder="Ketik ulang kata sandi baru"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs text-foreground/80">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-warning" />
          <p>
            Semua sesi login pada akun Anda akan diakhiri setelah kata sandi
            diubah. Anda perlu masuk kembali di setiap perangkat.
          </p>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending || !canSubmit}
          className="group/btn h-11 w-full gap-2 text-sm"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              Ubah kata sandi
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
