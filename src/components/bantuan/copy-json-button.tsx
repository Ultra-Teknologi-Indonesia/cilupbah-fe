"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CopyJsonButtonProps {
  data: unknown;
  label?: string;
  successMessage?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
}

export function CopyJsonButton({
  data,
  label = "Copy JSON",
  successMessage = "Berhasil menyalin JSON",
  className,
  variant = "outline",
  size = "sm",
}: CopyJsonButtonProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    try {
      const text = JSON.stringify(data, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(successMessage);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Gagal menyalin");
    }
  }, [data, successMessage]);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("gap-1.5", className)}
    >
      {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
      {label}
    </Button>
  );
}
