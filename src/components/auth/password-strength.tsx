"use client";

import { Check, X } from "lucide-react";

import { cn } from "@/lib/utils";

export const PASSWORD_RULES = [
  {
    key: "length",
    label: "Minimal 8 karakter",
    test: (v: string) => v.length >= 8,
  },
  {
    key: "upper",
    label: "Huruf besar (A-Z)",
    test: (v: string) => /[A-Z]/.test(v),
  },
  {
    key: "lower",
    label: "Huruf kecil (a-z)",
    test: (v: string) => /[a-z]/.test(v),
  },
  { key: "number", label: "Angka (0-9)", test: (v: string) => /\d/.test(v) },
  {
    key: "special",
    label: "Karakter spesial (!@#$...)",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

export function getPasswordStrength(password: string) {
  const passed = PASSWORD_RULES.filter((r) => r.test(password)).length;
  if (passed <= 2)
    return {
      level: "Lemah",
      color: "bg-destructive",
      percent: passed <= 1 ? 20 : 40,
    };
  if (passed <= 3) return { level: "Sedang", color: "bg-warning", percent: 60 };
  if (passed <= 4) return { level: "Kuat", color: "bg-success", percent: 80 };
  return { level: "Sangat Kuat", color: "bg-success", percent: 100 };
}

export function isPasswordStrong(password: string): boolean {
  return PASSWORD_RULES.every((r) => r.test(password));
}

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export function PasswordStrength({
  password,
  className,
}: PasswordStrengthProps) {
  const strength = getPasswordStrength(password);
  const hasInput = password.length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Kekuatan kata sandi</span>
          <span
            className={cn(
              "font-medium",
              hasInput ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {hasInput ? strength.level : "—"}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full transition-all duration-300",
              hasInput ? strength.color : "bg-transparent",
            )}
            style={{ width: hasInput ? `${strength.percent}%` : "0%" }}
          />
        </div>
      </div>

      <ul className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
        {PASSWORD_RULES.map((rule) => {
          const ok = rule.test(password);
          return (
            <li
              key={rule.key}
              className={cn(
                "flex items-center gap-2 transition-colors",
                ok ? "text-success" : "text-muted-foreground",
              )}
            >
              {ok ? (
                <Check className="size-3.5 shrink-0" />
              ) : (
                <X className="size-3.5 shrink-0" />
              )}
              <span>{rule.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
