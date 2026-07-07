import JsBarcode from "jsbarcode";

import type { BarcodeHarga } from "@/types/laporan/barcode";
import type { PrintableLabel } from "@/lib/laporan/barcode-labels";

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function money(n: number | null | undefined): string {
  if (n == null) return "";
  return "Rp" + Math.round(n).toLocaleString("id-ID");
}

/**
 * Cetak label barcode lewat window baru (bukan window.print() di halaman ini)
 * karena LiquidGlass memakai position:relative yang merusak trik CSS
 * "print hanya elemen ini". Barcode digambar via JsBarcode langsung ke SVG
 * milik window baru — tidak butuh Tailwind atau CDN eksternal.
 */
export function printBarcodeLabels(
  printable: PrintableLabel[],
  harga: BarcodeHarga,
) {
  if (printable.length === 0) return;

  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  const cards = printable
    .map((item, i) => {
      const top =
        harga === "online"
          ? `<div class="store-row"><span>${esc(item.storeName ?? "-")}</span><span class="mono">${esc(item.sku)}</span></div>`
          : `<div class="name">${esc(item.name)}</div>`;
      const bottomSku =
        harga !== "online" ? `<div class="sku">${esc(item.sku)}</div>` : "";
      const price =
        item.price != null ? `<div class="price">${money(item.price)}</div>` : "";
      return `<div class="label">${top}<svg id="bc-${i}"></svg>${bottomSku}${price}</div>`;
    })
    .join("");

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Label Barcode</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { box-sizing: border-box; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; margin: 0; padding: 8px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .label {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 2px; border: 1px solid #000; border-radius: 2px; padding: 6px 8px;
      text-align: center; break-inside: avoid; page-break-inside: avoid;
    }
    .label svg { width: 100%; height: 42px; }
    .name { font-size: 8px; font-weight: 700; line-height: 1.15; max-height: 28px; overflow: hidden; }
    .sku { font-family: ui-monospace, "SFMono-Regular", monospace; font-weight: 700; font-size: 10px; }
    .price { font-weight: 700; font-size: 10px; }
    .store-row { display: flex; justify-content: space-between; width: 100%; font-size: 8px; font-weight: 700; gap: 4px; }
    .mono { font-family: ui-monospace, monospace; }
    @media print { button { display: none; } }
  </style>
  </head><body>
    <div class="grid">${cards}</div>
    <div style="margin-top:12px"><button onclick="window.print()" style="padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer">Cetak / Simpan PDF</button></div>
  </body></html>`);
  win.document.close();

  printable.forEach((item, i) => {
    const svg = win.document.getElementById(`bc-${i}`);
    if (!svg) return;
    try {
      JsBarcode(svg, item.sku, {
        format: "CODE128",
        displayValue: false,
        height: 42,
        width: 1.4,
        margin: 0,
      });
    } catch {
      // Nilai SKU tidak valid untuk CODE128 — biarkan svg kosong.
    }
  });
}
