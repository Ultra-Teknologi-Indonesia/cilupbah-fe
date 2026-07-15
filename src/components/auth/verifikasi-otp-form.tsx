"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2 } from "lucide-react";

import {
  useForgotPassword,
  useVerifyResetOtp,
} from "@/hooks/auth/use-auth";
import { apiError, apiSuccess } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { saveResetFlow } from "@/lib/reset-flow-storage";
import {
  verifyOtpSchema,
  type VerifyOtpValues,
} from "@/schemas/auth/verify-otp.schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const RESEND_SECONDS = 60;

export function VerifikasiOtpForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const [countdown, setCountdown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) {
      router.replace("/lupa-password");
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const form = useForm<VerifyOtpValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { email, otp: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    form.setValue("email", email);
  }, [email, form]);

  const verifyMutation = useVerifyResetOtp();
  const resendMutation = useForgotPassword();

  const onSubmit = (values: VerifyOtpValues) => {
    verifyMutation.mutate(values, {
      onSuccess: (res) => {
        const data = res.data;
        if (!data?.reset_token) {
          apiError(
            { message: "Respons tidak valid dari server." },
            "Gagal verifikasi",
          );
          return;
        }
        saveResetFlow({
          email: values.email,
          reset_token: data.reset_token,
          expires_at: data.expires_at,
        });
        apiSuccess(res, "Kode terverifikasi");
        router.push(
          `/lupa-password/reset?email=${encodeURIComponent(values.email)}`,
        );
      },
      onError: (error) => {
        form.setValue("otp", "");
        apiError(error, "Gagal verifikasi kode");
      },
    });
  };

  const handleResend = () => {
    if (countdown > 0 || !email) return;
    resendMutation.mutate(
      { email },
      {
        onSuccess: (res) => {
          apiSuccess(res, "Kode dikirim ulang");
          setCountdown(RESEND_SECONDS);
          form.setValue("otp", "");
        },
        onError: (error) => apiError(error, "Gagal mengirim ulang kode"),
      },
    );
  };

  const isSubmitting = verifyMutation.isPending;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-5", className)}
        noValidate
      >
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center">
              <FormControl>
                <InputOTP
                  maxLength={6}
                  autoFocus
                  disabled={isSubmitting}
                  value={field.value}
                  onChange={(val) => {
                    field.onChange(val);
                    if (val.length === 6) {
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting || form.watch("otp").length !== 6}
          className="group/btn h-11 w-full gap-2 text-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memverifikasi...
            </>
          ) : (
            <>
              Verifikasi
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </Button>

        <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
          <div>
            Tidak menerima kode?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || resendMutation.isPending}
              className="font-medium text-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:text-muted-foreground disabled:hover:text-muted-foreground"
            >
              {resendMutation.isPending
                ? "Mengirim..."
                : countdown > 0
                  ? `Kirim ulang dalam ${countdown}s`
                  : "Kirim ulang kode"}
            </button>
          </div>
          <Link
            href="/lupa-password"
            className="transition-colors hover:text-foreground"
          >
            Ganti email
          </Link>
        </div>
      </form>
    </Form>
  );
}
