"use client";

import { useCallback } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCopyToClipboard } from "@/hooks/shared/use-copy-to-clipboard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface CopySkuProps {
  sku: string;
  className?: string;
}

export function CopySku({ sku, className }: CopySkuProps) {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      copy(sku, "SKU disalin ke clipboard");
    },
    [copy, sku],
  );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "group/sku inline-flex items-center gap-1 rounded px-1 -mx-1 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            className,
          )}
          aria-label="Salin SKU"
        >
          <span className="font-mono text-2xs text-foreground">{sku}</span>
          {copied ? (
            <CheckIcon className="size-3 shrink-0 text-success" />
          ) : (
            <CopyIcon className="size-3 shrink-0 text-muted-foreground/60 opacity-0 transition-opacity group-hover/sku:opacity-100" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        {copied ? "Tersalin" : "Salin SKU"}
      </TooltipContent>
    </Tooltip>
  );
}
