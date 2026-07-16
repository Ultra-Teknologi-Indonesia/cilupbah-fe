import * as React from "react";

import { cn } from "@/lib/utils";

interface FormFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Canonical action footer for form pages. Holds the primary Batal/Simpan
 * buttons and sits as the last element of a form's vertical stack. Form
 * action buttons must live here, never in the PageTitle header.
 */
export function FormFooter({ children, className }: FormFooterProps) {
  return (
    <div
      className={cn("flex flex-wrap items-center justify-end gap-2", className)}
    >
      {children}
    </div>
  );
}
