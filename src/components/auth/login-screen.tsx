"use client";

import { motion, type Variants } from "framer-motion";
import { Sparkles } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 18 } },
};

export function LoginScreen() {
  return (
    <main
      className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden p-4 sm:p-6"
      style={{
        backgroundColor: "#fbfcff",
        backgroundImage:
          "radial-gradient(at 0% 0%, #e7eef8 0px, transparent 55%), radial-gradient(at 100% 100%, #e8eef7 0px, transparent 55%)",
      }}
    >
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="w-full max-w-md"
      >
        <Card className="gap-8 py-10">
          <CardHeader>
            <motion.div variants={item} className="flex flex-col items-center text-center">
              <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-white/30 bg-gradient-to-br from-white/60 to-white/10 shadow-lg backdrop-blur-md dark:border-white/10 dark:from-white/15 dark:to-white/0">
                <Sparkles className="size-6 text-foreground/80" />
              </div>
              <CardTitle className="text-2xl tracking-tight">
                Selamat datang kembali
              </CardTitle>
              <CardDescription className="mt-1.5 max-w-xs">
                Masuk ke akun <span className="font-medium text-foreground/80">Cilupbah</span> untuk
                melanjutkan.
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent>
            <motion.div variants={item}>
              <LoginForm />
            </motion.div>
          </CardContent>

          <CardFooter>
            <motion.p
              variants={item}
              className="w-full text-center text-sm text-muted-foreground"
            >
              Belum punya akun?{" "}
              <a href="#" className="font-medium text-foreground transition-colors hover:underline">
                Daftar sekarang
              </a>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </main>
  );
}
