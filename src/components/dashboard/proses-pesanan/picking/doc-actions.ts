// Implementasi dipindah ke layer hooks agar komponen tidak mengimpor
// `@/services/*` langsung (aturan lint no-restricted-imports). File ini tetap
// ada sebagai re-export supaya import path lama (`../picking/doc-actions`) utuh.
export { DocActions } from "@/hooks/proses-pesanan/use-doc-actions"
