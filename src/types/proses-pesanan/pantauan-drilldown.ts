import type {
  FulfillmentListParams,
  OutboundMonitoringPeriod,
} from "./fulfillment";

export type PantauanMonitoringField = keyof Pick<
  OutboundMonitoringPeriod,
  "pick" | "pending" | "pack" | "readyToShip" | "waitingShip"
>;

export interface PantauanColumn {
  slug: string;
  label: string;
  stage: string;
  monitoringField: PantauanMonitoringField;
}

export const PANTAUAN_COLUMNS: readonly PantauanColumn[] = [
  {
    slug: "picking",
    label: "Picking",
    stage: "on-picking",
    monitoringField: "pick",
  },
  {
    slug: "ditunda",
    label: "Ditunda",
    stage: "empty-stock",
    monitoringField: "pending",
  },
  {
    slug: "packing",
    label: "Packing",
    stage: "on-packing",
    monitoringField: "pack",
  },
  {
    slug: "siap-kirim",
    label: "Siap Kirim",
    stage: "finish-pack",
    monitoringField: "readyToShip",
  },
  {
    slug: "menunggu-pengiriman",
    label: "Menunggu Pengiriman",
    stage: "ready-to-ship",
    monitoringField: "waitingShip",
  },
];

export function pantauanColumnBySlug(slug: string): PantauanColumn | undefined {
  return PANTAUAN_COLUMNS.find((c) => c.slug === slug);
}

export const DAY_TERMS = [0, 1, 2, 3, 4] as const;
export type DayTerm = (typeof DAY_TERMS)[number];

export const DAY_TERM_LABEL: Record<number, string> = {
  0: "Hari ini",
  1: "1 Hari",
  2: "2 Hari",
  3: "3 Hari",
  4: "> 3 Hari",
};

export function isValidDayTerm(value: number): value is DayTerm {
  return (DAY_TERMS as readonly number[]).includes(value);
}

function localDateOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dayTermDateRange(
  dayTerm: number,
): Pick<FulfillmentListParams, "date_from" | "date_to"> {
  if (dayTerm <= 0) {
    return { date_from: localDateOffset(0) };
  }
  if (dayTerm >= 4) {
    return { date_to: localDateOffset(4) };
  }
  const date = localDateOffset(dayTerm);
  return { date_from: date, date_to: date };
}

export function pantauanDetailHref(slug: string, dayTerm: number): string {
  return `/dashboard/proses-pesanan/pantauan/${slug}/${dayTerm}`;
}
