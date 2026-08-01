import { cn } from "@/lib/utils";

// Di-inline saat build oleh next.config.ts (env.NEXT_PUBLIC_APP_VERSION).
const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

export function AppVersion({ className }: { className?: string }) {
  return (
    <p className={cn("text-center text-xs text-muted-foreground", className)}>
      Cilupbah Superapps · {APP_VERSION}
    </p>
  );
}
