"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const DEFAULT_MESSAGE = "Disalin ke clipboard";

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export interface UseCopyToClipboardOptions {
  resetDelay?: number;
}

export interface UseCopyToClipboard {
  copied: boolean;

  copy: (text: string, message?: string | null) => Promise<void>;
}

export function useCopyToClipboard(
  options: UseCopyToClipboardOptions = {},
): UseCopyToClipboard {
  const { resetDelay = 1500 } = options;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string, message?: string | null) => {
      const ok = await writeToClipboard(text);

      if (!ok) {
        toast.error("Gagal menyalin ke clipboard");
        return;
      }

      if (message !== null) {
        toast.success(message ?? DEFAULT_MESSAGE);
      }

      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), resetDelay);
    },
    [resetDelay],
  );

  return { copied, copy };
}
