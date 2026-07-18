"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Mail } from "lucide-react";

import { useLogin } from "@/hooks/auth/use-auth";
import { setLoginSession } from "@/app/actions/auth.actions";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { apiError } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(1, "Password wajib diisi")
    .min(6, "Password minimal 6 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("logout") === "success") {
      toast.success("Berhasil keluar.");
      window.history.replaceState(null, "", "/login");
    }
  }, [searchParams]);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const mutation = useLogin();

  const onSubmit = (values: LoginValues) =>
    mutation.mutate(values, {
      onSuccess: async (res) => {
        if (res.data?.access_token && res.data?.refresh_token) {
          await setLoginSession({
            access_token: res.data.access_token,
            refresh_token: res.data.refresh_token,
            expires_in: res.data.expires_in,
            refresh_expires_in: res.data.refresh_expires_in,
          });
        }
        toast.success("Berhasil masuk", {
          description: res.data?.user?.name
            ? `Selamat datang kembali, ${res.data.user.name}.`
            : "Mengalihkan ke dashboard…",
        });
        const callbackUrl = new URLSearchParams(window.location.search).get(
          "callbackUrl",
        );
        router.push(
          callbackUrl && callbackUrl.startsWith("/")
            ? callbackUrl
            : "/dashboard",
        );
      },
      onError: (error) => {
        apiError(error, "Gagal masuk");
      },
    });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-5", className)}
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground/70">Email</FormLabel>
              <FormControl>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="nama@email.com"
                    className="h-11 border-white/20 bg-background/40 pl-10 backdrop-blur-md"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel className="text-foreground/70">Password</FormLabel>
                <Link
                  href="/lupa-password"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Lupa password?
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending}
          className="group/btn h-11 w-full gap-2 text-sm"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memproses...
            </>
          ) : (
            <>
              Masuk
              <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
