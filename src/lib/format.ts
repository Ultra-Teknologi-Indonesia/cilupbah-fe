const dateShort = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateLong = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateTime = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateTimeFull = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
  timeZoneName: "short",
});

const currencyIdr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberId = new Intl.NumberFormat("id-ID");

function toDate(d: string | number | Date | null | undefined): Date | null {
  if (d == null || d === "") return null;
  const date = d instanceof Date ? d : new Date(d);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDate(
  d: string | number | Date | null | undefined,
): string {
  const date = toDate(d);
  return date ? dateShort.format(date) : "—";
}

export function formatDateLong(
  d: string | number | Date | null | undefined,
): string {
  const date = toDate(d);
  return date ? dateLong.format(date) : "—";
}

export function formatDateTime(
  d: string | number | Date | null | undefined,
): string {
  const date = toDate(d);
  return date ? dateTime.format(date) : "—";
}

export function formatDateTimeFull(
  d: string | number | Date | null | undefined,
): string {
  const date = toDate(d);
  return date ? dateTimeFull.format(date) : "—";
}

export function formatCurrency(n: number | null | undefined): string {
  return n == null || Number.isNaN(n) ? "—" : currencyIdr.format(n);
}

export function formatNumber(n: number | null | undefined): string {
  return n == null || Number.isNaN(n) ? "—" : numberId.format(n);
}
