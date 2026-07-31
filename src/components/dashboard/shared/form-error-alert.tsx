"use client";

import { AlertTriangleIcon, XIcon } from "lucide-react";

import type { ServerErrorItem } from "@/lib/master-produk/humanize-server-errors";

export function FormErrorAlert({
  items,
  onDismiss,
  title = "Perbaiki kesalahan berikut sebelum menyimpan:",
}: {
  items: ServerErrorItem[];
  onDismiss?: () => void;
  title?: string;
}) {
  if (!items.length) return null;

  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3">
      <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-destructive" />
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium text-destructive">{title}</p>
        <ul className="list-disc space-y-0.5 pl-4 text-sm text-destructive/90">
          {items.map((it, i) => (
            <li key={`${it.label}-${i}`}>
              {it.label ? (
                <span className="font-medium">{it.label}: </span>
              ) : null}
              {it.message}
            </li>
          ))}
        </ul>
      </div>
      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 text-destructive/60 transition-colors hover:text-destructive"
          aria-label="Tutup"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
