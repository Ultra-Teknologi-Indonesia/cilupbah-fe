export interface LookupOption {
  value: string;
  label: string;
  hint?: string;
  /** Teks ringkas untuk badge terpilih (mis. SKU saja). Fallback ke `label`. */
  badgeLabel?: string;
}
