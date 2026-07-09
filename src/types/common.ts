export interface LookupOption {
  value: string;
  label: string;
  hint?: string;
  /** Teks ringkas untuk badge terpilih (mis. SKU saja). Fallback ke `label`. */
  badgeLabel?: string;
  /** URL gambar thumbnail opsional; jika ada ditampilkan di kiri opsi. */
  imageUrl?: string;
}
