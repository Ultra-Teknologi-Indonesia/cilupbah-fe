// Dipindah ke shared (dipakai lintas modul — transaksi-stok, barang-keluar,
// dll). Re-export agar 25 importer lama tetap jalan; impor baru langsung dari
// @/components/dashboard/shared/filter-toolbar.
export * from "@/components/dashboard/shared/filter-toolbar"
