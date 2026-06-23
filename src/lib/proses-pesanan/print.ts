// Renderer cetak: data report dari BE (JSON) dirender ke layout dokumen yang
// rapi lalu window.print() — pengguna bisa "Save as PDF". Branch per report_type.

function esc(v: unknown): string {
  return String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function money(v: unknown): string {
  const n = Number(v)
  if (!Number.isFinite(n)) return esc(v)
  return "Rp " + n.toLocaleString("id-ID")
}

type Row = Record<string, unknown>

function asArray(v: unknown): Row[] {
  if (Array.isArray(v)) return v as Row[]
  if (v && typeof v === "object") return [v as Row]
  return []
}

function get(o: Row | undefined | null, key: string): unknown {
  return o ? o[key] : undefined
}

// Tabel item: pakai kolom yang dikenal jika ada, jika tidak union semua key.
type Col = { key: string; label: string; money?: boolean }
function itemTable(items: Row[], cols: Col[]): string {
  if (!items.length) return "<p class='muted'>— tidak ada item —</p>"
  const present = cols.filter((c) => items.some((it) => it[c.key] != null))
  const use: Col[] = present.length
    ? present
    : Array.from(
        items.reduce((s, it) => (Object.keys(it).forEach((k) => s.add(k)), s), new Set<string>())
      ).map((k) => ({ key: k, label: k }))
  const head = use.map((c) => `<th>${esc(c.label)}</th>`).join("")
  const body = items
    .map(
      (it) =>
        `<tr>${use
          .map((c) => `<td>${c.money ? money(it[c.key]) : esc(it[c.key])}</td>`)
          .join("")}</tr>`
    )
    .join("")
  return `<table class="lines"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

function field(label: string, value: unknown): string {
  return `<div class="fld"><span class="lbl">${esc(label)}</span><span class="val">${esc(value)}</span></div>`
}

function docWrap(inner: string): string {
  return `<section class="doc">${inner}</section>`
}

// ── Per-jenis dokumen ────────────────────────────────────────────────────────
function labelDoc(orders: Row[]): string {
  return orders
    .map((o) =>
      docWrap(`
      <div class="doc-head"><h2>Label Pengiriman</h2><span class="chip">${esc(get(o, "source"))}</span></div>
      <div class="grid2">
        ${field("Kurir", get(o, "shipping_provider"))}
        ${field("No. Resi", get(o, "tracking_number"))}
        ${field("No. Pesanan", get(o, "salesorder_no"))}
        ${field("Pelanggan", get(o, "customer_name"))}
      </div>
      <div class="box">
        <div class="box-title">Penerima</div>
        <div class="strong">${esc(get(o, "shipping_full_name"))} · ${esc(get(o, "shipping_phone"))}</div>
        <div>${esc(get(o, "shipping_address"))}</div>
        <div>${esc(get(o, "shipping_area"))}, ${esc(get(o, "shipping_city"))}, ${esc(
        get(o, "shipping_province")
      )} ${esc(get(o, "shipping_post_code"))}</div>
      </div>
      ${itemTable(asArray(get(o, "items")), [
        { key: "sku", label: "SKU" },
        { key: "description", label: "Produk" },
        { key: "qty_in_base", label: "Qty" },
      ])}
    `)
    )
    .join("")
}

function invoiceDoc(invoices: Row[]): string {
  return invoices
    .map((inv) => {
      const order = get(inv, "order") as Row | null
      return docWrap(`
      <div class="doc-head"><h2>Faktur</h2><span class="chip">${esc(get(inv, "status"))}</span></div>
      <div class="grid2">
        ${field("No. Faktur", get(inv, "invoice_number"))}
        ${field("Tgl. Faktur", get(inv, "invoice_date"))}
        ${field("No. Pesanan", get(order, "salesorder_no"))}
        ${field("Pelanggan", get(inv, "customer_name") ?? get(order, "customer_name"))}
      </div>
      ${itemTable(asArray(get(inv, "items")), [
        { key: "sku", label: "SKU" },
        { key: "description", label: "Deskripsi" },
        { key: "qty_in_base", label: "Qty" },
        { key: "price", label: "Harga", money: true },
        { key: "amount", label: "Subtotal", money: true },
      ])}
      <div class="totals">
        ${field("Total", money(get(inv, "total_amount")))}
        ${field("Dibayar", money(get(inv, "paid_amount")))}
      </div>
    `)
    })
    .join("")
}

function pickListDoc(picklists: Row[]): string {
  return picklists
    .map((pl) => {
      const loc = get(pl, "location") as Row | null
      return docWrap(`
      <div class="doc-head"><h2>Picklist</h2><span class="chip">${esc(get(pl, "status"))}</span></div>
      <div class="grid2">
        ${field("No. Picklist", get(pl, "picklist_no"))}
        ${field("Lokasi", get(loc, "location_name"))}
      </div>
      ${itemTable(
        asArray(get(pl, "items")).map((it) => ({
          sku: it.sku,
          name: (get(it, "product") as Row | null)?.name,
          order: (get(it, "order") as Row | null)?.salesorder_no,
          qty_ordered: it.qty_ordered,
          qty_picked: it.qty_picked,
        })),
        [
          { key: "sku", label: "SKU" },
          { key: "name", label: "Produk" },
          { key: "order", label: "No. Pesanan" },
          { key: "qty_ordered", label: "Dipesan" },
          { key: "qty_picked", label: "Dipick" },
        ]
      )}
    `)
    })
    .join("")
}

function manifestDoc(shipments: Row[]): string {
  return shipments
    .map((s) => {
      const loc = get(s, "location") as Row | null
      const rows = asArray(get(s, "orders")).map((so, i) => {
        const o = (get(so, "order") as Row | null) ?? {}
        return {
          no: i + 1,
          salesorder_no: o.salesorder_no,
          customer: o.customer_name,
          resi: o.tracking_number,
          kurir: o.shipping_provider,
          alamat: `${esc(o.shipping_full_name)} — ${esc(o.shipping_address)}, ${esc(o.shipping_city)}`,
        }
      })
      return docWrap(`
      <div class="doc-head"><h2>Manifest Pengiriman</h2><span class="chip">${esc(get(s, "status"))}</span></div>
      <div class="grid2">
        ${field("Kurir", get(s, "courier_code"))}
        ${field("Tgl. Pengiriman", get(s, "shipment_date"))}
        ${field("Lokasi", get(loc, "location_name"))}
        ${field("Jumlah", rows.length)}
      </div>
      ${itemTable(rows, [
        { key: "no", label: "#" },
        { key: "salesorder_no", label: "No. Pesanan" },
        { key: "customer", label: "Pelanggan" },
        { key: "resi", label: "No. Resi" },
        { key: "kurir", label: "Kurir" },
        { key: "alamat", label: "Penerima" },
      ])}
    `)
    })
    .join("")
}

function genericDoc(data: unknown): string {
  const rows = asArray(data)
  if (!rows.length) return "<p class='muted'>— tidak ada data —</p>"
  return docWrap(itemTable(rows, []))
}

export function printReport(title: string, payload: unknown) {
  const win = window.open("", "_blank", "width=900,height=700")
  if (!win) return

  const wrapper = payload && typeof payload === "object" ? (payload as Row) : null
  const reportType = wrapper?.report_type as string | undefined
  const inner = wrapper && "data" in wrapper ? wrapper.data : payload
  const list = asArray(inner)

  let body: string
  switch (reportType) {
    case "shipping_label":
      body = labelDoc(list)
      break
    case "invoice":
      body = invoiceDoc(list)
      break
    case "pick_list":
      body = pickListDoc(list)
      break
    case "shipping_manifest":
      body = manifestDoc(list)
      break
    default:
      body = genericDoc(inner ?? payload)
  }

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>
    *{box-sizing:border-box}
    body{font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;color:#111827;margin:0;padding:28px;font-size:12px}
    h2{font-size:16px;margin:0}
    .doc{border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin:0 0 18px}
    .doc-head{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:10px;margin-bottom:12px}
    .chip{font-size:11px;border:1px solid #d1d5db;border-radius:999px;padding:2px 10px;color:#374151;text-transform:uppercase}
    .grid2{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px;margin-bottom:12px}
    .fld{display:flex;justify-content:space-between;gap:12px;padding:3px 0;border-bottom:1px dashed #f1f5f9}
    .lbl{color:#6b7280}.val{font-weight:500;text-align:right}
    .box{border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:0 0 12px;background:#f9fafb}
    .box-title{font-size:11px;text-transform:uppercase;color:#6b7280;margin-bottom:4px}
    .strong{font-weight:600}
    table.lines{width:100%;border-collapse:collapse;font-size:11px}
    table.lines th{text-align:left;border-bottom:1px solid #e5e7eb;padding:6px 8px;font-weight:600;background:#f9fafb}
    table.lines td{border-bottom:1px solid #f1f5f9;padding:6px 8px;vertical-align:top}
    .totals{display:flex;justify-content:flex-end;gap:24px;margin-top:10px}
    .totals .fld{min-width:200px;border:0}
    .muted{color:#9ca3af}
    @media print{ body{padding:0} .doc{break-inside:avoid;page-break-after:always;border:0;border-radius:0;padding:24px} .doc:last-child{page-break-after:auto} button{display:none} }
  </style></head><body>
    ${body}
    <div style="margin-top:8px"><button onclick="window.print()" style="padding:8px 16px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer">Cetak / Simpan PDF</button></div>
  </body></html>`)
  win.document.close()
}
