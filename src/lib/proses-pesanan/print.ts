// Renderer cetak generik: data JSON dari modul Report belum berupa PDF, jadi FE
// merender layout cetak sederhana lalu memicu window.print().
// Saat shape dokumen final tersedia, ganti renderer per-jenis di sini.

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function renderValue(v: unknown): string {
  if (v == null) return "<span style='color:#9ca3af'>—</span>"
  if (Array.isArray(v)) return renderTable(v as Record<string, unknown>[])
  if (typeof v === "object") return renderKeyValue(v as Record<string, unknown>)
  return esc(v)
}

function renderKeyValue(obj: Record<string, unknown>): string {
  const rows = Object.entries(obj)
    .map(
      ([k, val]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${esc(
          k
        )}</td><td style="padding:4px 0">${renderValue(val)}</td></tr>`
    )
    .join("")
  return `<table style="border-collapse:collapse;font-size:12px">${rows}</table>`
}

function renderTable(rows: Record<string, unknown>[]): string {
  if (!rows.length) return "<span style='color:#9ca3af'>— kosong —</span>"
  const cols = Array.from(
    rows.reduce((set, r) => {
      Object.keys(r ?? {}).forEach((k) => set.add(k))
      return set
    }, new Set<string>())
  )
  const head = cols
    .map(
      (c) =>
        `<th style="text-align:left;border-bottom:1px solid #e5e7eb;padding:6px 10px;font-weight:600">${esc(
          c
        )}</th>`
    )
    .join("")
  const body = rows
    .map(
      (r) =>
        `<tr>${cols
          .map(
            (c) =>
              `<td style="border-bottom:1px solid #f1f5f9;padding:6px 10px;vertical-align:top">${renderValue(
                (r ?? {})[c]
              )}</td>`
          )
          .join("")}</tr>`
    )
    .join("")
  return `<table style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

export function printReport(title: string, data: unknown) {
  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) return

  const body = Array.isArray(data)
    ? renderTable(data as Record<string, unknown>[])
    : data && typeof data === "object"
      ? renderKeyValue(data as Record<string, unknown>)
      : `<pre>${esc(data)}</pre>`

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(
    title
  )}</title><style>
    *{box-sizing:border-box}
    body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:#111827;margin:32px}
    h1{font-size:18px;margin:0 0 16px}
    @media print{button{display:none}}
  </style></head><body>
    <h1>${esc(title)}</h1>
    ${body}
    <div style="margin-top:24px"><button onclick="window.print()" style="padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer">Cetak</button></div>
  </body></html>`)
  win.document.close()
}
