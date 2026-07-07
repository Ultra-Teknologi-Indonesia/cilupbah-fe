import { fetchClient } from "@/lib/api-client";

function deriveActivityType(filename: string): string {
  const base = filename.replace(/\.[^/.]+$/, "");
  const label = base
    .split(/[-_]/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `Export ${label}`;
}

function recordExportActivity(activityType: string) {
  fetchClient("/impex/activities/export/record", {
    method: "POST",
    data: { activity_type: activityType },
  }).catch(() => {});
}

export function exportCsv(
  filename: string,
  headers: string[],
  rows: string[][],
) {
  const escape = (v: string) => {
    if (v.includes(",") || v.includes('"') || v.includes("\n")) {
      return `"${v.replace(/"/g, '""')}"`;
    }
    return v;
  };

  const csv = [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ].join("\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  recordExportActivity(deriveActivityType(filename));
}
