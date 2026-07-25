"use client";

import * as React from "react";
import { ScanBarcodeIcon, ListChecksIcon, CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Combobox } from "@/components/ui/combobox";
import { playScanFeedback, primeScanAudio } from "@/lib/scan-feedback";

export interface ScanAutoflowLine {
  id: string;

  primary: string;

  secondary?: string;

  codes: string[];

  done?: boolean;

  imageUrl?: string;
}

interface ScanAutoflowBarProps {
  lines: ScanAutoflowLine[];

  onResolve: (line: ScanAutoflowLine) => void;

  onUnmatched?: (code: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  scanPlaceholder?: string;
  manualPlaceholder?: string;

  hideManualSelect?: boolean;
  hint?: string;
  className?: string;

  refocusKey?: number | string;

  sound?: boolean;

  interceptCode?: (code: string) => boolean;
}

function normalize(code: string): string {
  return code.trim().toLowerCase().replace(/\s+/g, "");
}

export function ScanAutoflowBar({
  lines,
  onResolve,
  onUnmatched,
  disabled,
  autoFocus = true,
  scanPlaceholder = "Scan / ketik kode lalu Enter…",
  manualPlaceholder = "Pilih manual…",
  hideManualSelect = false,
  hint = "Gunakan scanner, atau pilih manual lewat dropdown.",
  className,
  refocusKey,
  sound = true,
  interceptCode,
}: ScanAutoflowBarProps) {
  const [code, setCode] = React.useState("");
  const [flash, setFlash] = React.useState<"ok" | "err" | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (autoFocus && !disabled) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [autoFocus, disabled]);

  const focusScan = React.useCallback(() => {
    inputRef.current?.focus();
  }, []);

  React.useEffect(() => {
    if (refocusKey === undefined || disabled) return;
    const t = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [refocusKey, disabled]);

  const flashState = React.useCallback(
    (s: "ok" | "err") => {
      setFlash(s);
      if (sound) playScanFeedback(s === "ok" ? "ok" : "error");
      setTimeout(() => setFlash(null), 350);
    },
    [sound],
  );

  const resolveByCode = React.useCallback(
    (raw: string) => {
      const n = normalize(raw);
      if (!n) return;

      if (interceptCode?.(raw.trim())) {
        flashState("ok");
        setCode("");
        focusScan();
        return;
      }

      const pending = lines.find(
        (l) => !l.done && l.codes.some((c) => normalize(c) === n),
      );
      const anyMatch =
        pending ?? lines.find((l) => l.codes.some((c) => normalize(c) === n));

      if (anyMatch) {
        onResolve(anyMatch);
        flashState("ok");
      } else if (onUnmatched) {
        onUnmatched(raw.trim());
      } else {
        flashState("err");
      }
      setCode("");
      focusScan();
    },
    [lines, onResolve, onUnmatched, flashState, focusScan, interceptCode],
  );

  const manualOptions = React.useMemo(
    () =>
      lines.map((l) => ({
        value: l.id,
        label: l.primary,
        imageUrl: l.imageUrl,
        hint:
          [l.secondary, l.done ? "✓ selesai" : null]
            .filter(Boolean)
            .join(" · ") || undefined,
      })),
    [lines],
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <ScanBarcodeIcon
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
              flash === "ok"
                ? "text-success"
                : flash === "err"
                  ? "text-destructive"
                  : "text-muted-foreground",
            )}
          />
          <Input
            ref={inputRef}
            value={code}
            disabled={disabled}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => {
              primeScanAudio();
              if (e.key === "Enter") {
                e.preventDefault();
                resolveByCode(code);
              }
            }}
            placeholder={scanPlaceholder}
            className={cn(
              "h-11 pl-9 text-base transition-colors",
              flash === "ok" && "border-success ring-2 ring-success/30",
              flash === "err" &&
                "border-destructive ring-2 ring-destructive/30",
            )}
            aria-label="Scan kode"
            autoComplete="off"
            inputMode="text"
          />
        </div>

        {lines.length > 0 && !hideManualSelect && (
          <div className="flex items-center gap-2 sm:w-80">
            <ListChecksIcon className="hidden size-4 shrink-0 text-muted-foreground sm:block" />
            <Combobox
              options={manualOptions}
              value={null}
              wrap
              onChange={(v) => {
                primeScanAudio();
                if (!v) return;
                const line = lines.find((l) => l.id === v);
                if (line) {
                  onResolve(line);
                  flashState("ok");
                  focusScan();
                }
              }}
              placeholder={manualPlaceholder}
              searchPlaceholder="Cari produk / SKU…"
              emptyText="Tidak ada item."
              disabled={disabled}
              className="min-h-11 flex-1"
            />
          </div>
        )}
      </div>
      {hint && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckIcon className="size-3" />
          {hint}
        </p>
      )}
    </div>
  );
}
