"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, TriangleAlert } from "lucide-react";

import { AuthService } from "@/services/auth/auth.service";
import type { ApiResponse } from "@/types/api.types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi").min(6, "Password minimal 6 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: (values: LoginValues) => AuthService.login(values),
    onSuccess: (res) => {
      if (res.data?.access_token) {
        localStorage.setItem("access_token", res.data.access_token);
      }
      router.push("/dashboard");
    },
  });

  const errorMessage = mutation.error
    ? (mutation.error as Partial<ApiResponse>).message ||
      "Email atau password salah. Silakan coba lagi."
    : null;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className={cn("space-y-5", className)}
        noValidate
      >
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className="flex items-center gap-2.5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive backdrop-blur-md"
            >
              <TriangleAlert className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

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
                <a
                  href="#"
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Lupa password?
                </a>
              </div>
              <FormControl>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="h-11 border-white/20 bg-background/40 px-10 backdrop-blur-md"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
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
