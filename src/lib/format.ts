// Single source of truth untuk format tampilan tanggal & angka (id-ID).
// Jangan definisikan formatDate/formatCurrency lokal di komponen — impor dari
// sini agar format konsisten di seluruh aplikasi (lihat AUDIT-FE.md §4.1).

const dateShort = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
})

const dateLong = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
})

const dateTime = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

const currencyIdr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const numberId = new Intl.NumberFormat("id-ID")

function toDate(d: string | number | Date | null | undefined): Date | null {
  if (d == null || d === "") return null
  const date = d instanceof Date ? d : new Date(d)
  return Number.isNaN(date.getTime()) ? null : date
}

/** "07 Jul 2026" — format tanggal standar list/tabel. */
export function formatDate(d: string | number | Date | null | undefined): string {
  const date = toDate(d)
  return date ? dateShort.format(date) : "—"
}

/** "07 Juli 2026" — untuk halaman detail yang butuh bulan penuh. */
export function formatDateLong(d: string | number | Date | null | undefined): string {
  const date = toDate(d)
  return date ? dateLong.format(date) : "—"
}

/** "07 Jul 2026, 14.30" — tanggal + jam. */
export function formatDateTime(d: string | number | Date | null | undefined): string {
  const date = toDate(d)
  return date ? dateTime.format(date) : "—"
}

/** "Rp 15.000" — rupiah tanpa desimal. */
export function formatCurrency(n: number | null | undefined): string {
  return n == null || Number.isNaN(n) ? "—" : currencyIdr.format(n)
}

/** "15.000" — angka dengan pemisah ribuan id-ID. */
export function formatNumber(n: number | null | undefined): string {
  return n == null || Number.isNaN(n) ? "—" : numberId.format(n)
}
