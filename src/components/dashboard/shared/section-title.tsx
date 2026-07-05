import * as React from "react";

import { cn } from "@/lib/utils";

interface SectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Canonical heading for in-card sections on detail/form pages. Keeps section
 * titles at one consistent size/weight instead of the text-sm vs text-base
 * drift. Page-level titles use `PageTitle`, not this.
 */
export function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h3 className={cn("text-sm font-semibold text-foreground", className)}>
      {children}
    </h3>
  );
}
