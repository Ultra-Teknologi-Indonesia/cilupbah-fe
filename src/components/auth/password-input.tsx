"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Eye, Lock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  showIcon?: boolean;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, showIcon = true, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="group relative">
      {showIcon ? (
        <Lock className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
      ) : null}
      <Input
        ref={ref}
        type={visible ? "text" : "password"}
        className={cn(
          "h-11 border-white/20 bg-background/40 backdrop-blur-md",
          showIcon ? "px-10" : "pr-10",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        tabIndex={-1}
        className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
        aria-pressed={visible}
      >
        <span className="relative grid size-4 place-items-center">
          <Eye className="size-4" />
          <span className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="block h-[1.6px] w-[22px] -rotate-45">
              <motion.span
                className="block h-full w-full origin-right rounded-full bg-current"
                initial={false}
                animate={{ scaleX: visible ? 0 : 1 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              />
            </span>
          </span>
        </span>
      </button>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";
