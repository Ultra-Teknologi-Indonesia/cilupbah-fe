"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { LiquidGlass } from "@/components/ui/liquid-glass";

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  intensity?: "subtle" | "default" | "strong";

  padded?: boolean;
}

export function Surface({
  radius = 16,
  intensity = "subtle",
  padded = false,
  className,
  children,
  ...props
}: SurfaceProps) {
  return (
    <LiquidGlass
      radius={radius}
      intensity={intensity}
      className={cn("bg-white/40 dark:bg-white/[0.06]", className)}
      {...props}
    >
      {padded ? <div className="px-5 py-5">{children}</div> : children}
    </LiquidGlass>
  );
}
