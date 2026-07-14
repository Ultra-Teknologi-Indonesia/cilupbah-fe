export interface ManualEntry {
  slug: string;
  moduleGroup: string;
  title: string;
  description?: string;
  keywords?: string[];
  route?: string;
  content: string;
}

import { onboardingLoginAktivasi, onboardingTurCepat, onboardingSetupProfil } from "@/content/manual/onboarding";
import { pesananDaftar, pesananDetailTimeline, pesananInputManual, pesananImportExport, pesananBatalkan, pesananStatus, pesananRiwayat } from "@/content/manual/pesanan";
import { prosesAlokasiStok, prosesPicking, prosesPacking, prosesShipping, prosesTerkirim, prosesSelesai, prosesScanAutoflow, prosesBuktiPickup, prosesKurirInstan } from "@/content/manual/proses-pesanan";
import { produkTambah, produkVarianBundle, produkMappingChannel, produkSyncStokHarga, produkDownloadMarketplace, produkArchiveDelete } from "@/content/manual/produk";
import { barangMasukPenerimaan, barangMasukPutaway, barangMasukAssign } from "@/content/manual/barang-masuk";
import { barangKeluarTransfer, barangKeluarSuratJalan, barangKeluarRevert } from "@/content/manual/barang-keluar";
import { transaksiStokTabTransfer, transaksiStokPenempatan, transaksiStokPengambilan, transaksiStokPenyesuaian, transaksiStokTransferBin, transaksiStokRiwayat } from "@/content/manual/transaksi-stok";
import { posisiStokBaca, posisiStokToggleLokasi, posisiStokExport } from "@/content/manual/posisi-stok";
import { monitorStokWatchlist, monitorStokReorderPoint } from "@/content/manual/monitor-stok";
import { lokasiGudangZoneRak, lokasiBulkAssign, lokasiDeactivate } from "@/content/manual/lokasi";
import { kategoriMerek } from "@/content/manual/kategori-merek";
import { kontakPelanggan, kontakPemasok } from "@/content/manual/kontak";
import { integrasiKoneksi, integrasiShopee, integrasiLazada, integrasiTikTok, integrasiWooCommerce, integrasiRefreshToken, integrasiToggleSync } from "@/content/manual/integrasi-channel";
import { tokoInternalSetup } from "@/content/manual/toko-internal";
import { returTerima, returManual, returLaporan } from "@/content/manual/retur";
import { pembelianBuatPo, pembelianApproval, pembelianPoBayar } from "@/content/manual/pembelian";
import { permintaanRestockRequest } from "@/content/manual/permintaan-restock";
import { laporanDaftar, laporanFilterExport, laporanPasteAi } from "@/content/manual/laporan";
import { notifikasiBell, notifikasiKanal } from "@/content/manual/notifikasi";
import { impexStatus, impexDownload } from "@/content/manual/impex";
import { pengaturanUmum, pengaturanPengguna, pengaturanRbac, pengaturanPersediaan } from "@/content/manual/pengaturan";
import { profilTabProfil, profilKeamanan, profilSesiRiwayat, profilPreferensi } from "@/content/manual/profil-saya";
import { standarSearch, standarTabel, standarScan, standarUserSelect, standarPhone, standarKembali } from "@/content/manual/standar";

const g = (v: unknown): string => (typeof v === "string" ? v : "");

export const MANUAL_ENTRIES: ManualEntry[] = [
  // ONBOARDING
  { slug: "onboarding/login-aktivasi", moduleGroup: "Onboarding", title: "Aktivasi akun & login pertama", content: g(onboardingLoginAktivasi) },
  { slug: "onboarding/tur-cepat", moduleGroup: "Onboarding", title: "Tur cepat sidebar & layout", content: g(onboardingTurCepat) },
  { slug: "onboarding/setup-profil", moduleGroup: "Onboarding", title: "Setup Profil Saya (4 tab)", content: g(onboardingSetupProfil) },

  // PESANAN
  { slug: "pesanan/status-pesanan", moduleGroup: "Pesanan", title: "Arti setiap status pesanan", route: "/dashboard/pesanan", content: g(pesananStatus) },
  { slug: "pesanan/daftar-pesanan", moduleGroup: "Pesanan", title: "Daftar pesanan: filter, search, sort, kolom", route: "/dashboard/pesanan", content: g(pesananDaftar) },
  { slug: "pesanan/detail-timeline", moduleGroup: "Pesanan", title: "Detail pesanan & panel Alokasi", route: "/dashboard/pesanan", content: g(pesananDetailTimeline) },
  { slug: "pesanan/riwayat-pesanan", moduleGroup: "Pesanan", title: "Riwayat Pesanan (timeline lifecycle)", route: "/dashboard/pesanan", content: g(pesananRiwayat) },
  { slug: "pesanan/input-manual", moduleGroup: "Pesanan", title: "Input pesanan manual (offline/POS)", route: "/dashboard/pesanan", content: g(pesananInputManual) },
  { slug: "pesanan/import-export", moduleGroup: "Pesanan", title: "Import & export pesanan", route: "/dashboard/pesanan", content: g(pesananImportExport) },
  { slug: "pesanan/batalkan", moduleGroup: "Pesanan", title: "Membatalkan pesanan", route: "/dashboard/pesanan", content: g(pesananBatalkan) },

  // PROSES PESANAN
  { slug: "proses-pesanan/alokasi-stok", moduleGroup: "Proses Pesanan", title: "Alokasi Stok (reserve otomatis vs manual)", route: "/dashboard/pengaturan/alokasi-stok", content: g(prosesAlokasiStok) },
  { slug: "proses-pesanan/picking", moduleGroup: "Proses Pesanan", title: "Picking (Belum Mulai → Berjalan → Selesai)", route: "/dashboard/proses-pesanan/picking", content: g(prosesPicking) },
  { slug: "proses-pesanan/packing", moduleGroup: "Proses Pesanan", title: "Packing (multi-order, timbang, ukur)", route: "/dashboard/proses-pesanan/packing", content: g(prosesPacking) },
  { slug: "proses-pesanan/shipping", moduleGroup: "Proses Pesanan", title: "Shipping (cetak resi & pickup)", route: "/dashboard/proses-pesanan/shipping", content: g(prosesShipping) },
  { slug: "proses-pesanan/delivered", moduleGroup: "Proses Pesanan", title: "Terkirim (Delivered)", route: "/dashboard/proses-pesanan/delivered", content: g(prosesTerkirim) },
  { slug: "proses-pesanan/selesai", moduleGroup: "Proses Pesanan", title: "Selesai (Done) — arsip", route: "/dashboard/proses-pesanan/done", content: g(prosesSelesai) },
  { slug: "proses-pesanan/scan-autoflow", moduleGroup: "Proses Pesanan", title: "Scan Autoflow Bar (SOP scan)", content: g(prosesScanAutoflow) },
  { slug: "proses-pesanan/bukti-pickup", moduleGroup: "Proses Pesanan", title: "Bukti Pickup Kurir", content: g(prosesBuktiPickup) },
  { slug: "proses-pesanan/kurir-instan", moduleGroup: "Proses Pesanan", title: "Kurir Instan (Grab/Gojek) manual", content: g(prosesKurirInstan) },

  // PRODUK
  { slug: "produk/tambah", moduleGroup: "Produk", title: "Tambah produk (single, varian, bundle)", route: "/dashboard/produk", content: g(produkTambah) },
  { slug: "produk/varian-bundle", moduleGroup: "Produk", title: "Perbedaan Produk / Varian / Bundle", content: g(produkVarianBundle) },
  { slug: "produk/mapping-channel", moduleGroup: "Produk", title: "Mapping SKU ke channel", route: "/dashboard/produk", content: g(produkMappingChannel) },
  { slug: "produk/sync-stok-harga", moduleGroup: "Produk", title: "Sync stok & harga per store", route: "/dashboard/produk", content: g(produkSyncStokHarga) },
  { slug: "produk/download-marketplace", moduleGroup: "Produk", title: "Download produk baru dari marketplace", content: g(produkDownloadMarketplace) },
  { slug: "produk/archive-delete", moduleGroup: "Produk", title: "Archive vs Delete produk", content: g(produkArchiveDelete) },

  // BARANG MASUK
  { slug: "barang-masuk/penerimaan", moduleGroup: "Barang Masuk", title: "Penerimaan (PO / Transfer Masuk)", route: "/dashboard/barang-masuk", content: g(barangMasukPenerimaan) },
  { slug: "barang-masuk/putaway", moduleGroup: "Barang Masuk", title: "Penempatan (Putaway) via scan", route: "/dashboard/barang-masuk", content: g(barangMasukPutaway) },
  { slug: "barang-masuk/assign", moduleGroup: "Barang Masuk", title: "Assign penerimaan ke petugas", route: "/dashboard/barang-masuk", content: g(barangMasukAssign) },

  // BARANG KELUAR
  { slug: "barang-keluar/transfer-antar-gudang", moduleGroup: "Barang Keluar", title: "Transfer keluar manual antar gudang", route: "/dashboard/barang-keluar", content: g(barangKeluarTransfer) },
  { slug: "barang-keluar/surat-jalan", moduleGroup: "Barang Keluar", title: "Cetak Surat Jalan (submit = IN_TRANSIT)", route: "/dashboard/barang-keluar", content: g(barangKeluarSuratJalan) },
  { slug: "barang-keluar/revert", moduleGroup: "Barang Keluar", title: "Revert draft & delete in-transit", route: "/dashboard/barang-keluar", content: g(barangKeluarRevert) },

  // TRANSAKSI STOK
  { slug: "transaksi-stok/tab-transfer", moduleGroup: "Transaksi Stok", title: "Tab Transfer (Pindah Bin only)", route: "/dashboard/transaksi-stok", content: g(transaksiStokTabTransfer) },
  { slug: "transaksi-stok/penempatan", moduleGroup: "Transaksi Stok", title: "Penempatan", route: "/dashboard/transaksi-stok", content: g(transaksiStokPenempatan) },
  { slug: "transaksi-stok/pengambilan", moduleGroup: "Transaksi Stok", title: "Pengambilan", route: "/dashboard/transaksi-stok", content: g(transaksiStokPengambilan) },
  { slug: "transaksi-stok/penyesuaian", moduleGroup: "Transaksi Stok", title: "Penyesuaian (opname / koreksi)", route: "/dashboard/transaksi-stok", content: g(transaksiStokPenyesuaian) },
  { slug: "transaksi-stok/transfer-bin", moduleGroup: "Transaksi Stok", title: "Transfer Bin (2-langkah)", route: "/dashboard/transaksi-stok", content: g(transaksiStokTransferBin) },
  { slug: "transaksi-stok/riwayat", moduleGroup: "Transaksi Stok", title: "Riwayat mutasi stok", route: "/dashboard/transaksi-stok", content: g(transaksiStokRiwayat) },

  // POSISI STOK
  { slug: "posisi-stok/baca", moduleGroup: "Posisi Stok", title: "Membaca kolom per-lokasi (4 metrik + Total)", route: "/dashboard/posisi-stok", content: g(posisiStokBaca) },
  { slug: "posisi-stok/toggle-lokasi", moduleGroup: "Posisi Stok", title: "Toggle Lokasi (persist localStorage)", route: "/dashboard/posisi-stok", content: g(posisiStokToggleLokasi) },
  { slug: "posisi-stok/export", moduleGroup: "Posisi Stok", title: "Export posisi stok", route: "/dashboard/posisi-stok", content: g(posisiStokExport) },

  // MONITOR STOK
  { slug: "monitor-stok/watchlist", moduleGroup: "Monitor Stok", title: "Watchlist stok minus", route: "/dashboard/monitor-stok", content: g(monitorStokWatchlist) },
  { slug: "monitor-stok/reorder-point", moduleGroup: "Monitor Stok", title: "Reorder point alert", route: "/dashboard/monitor-stok", content: g(monitorStokReorderPoint) },

  // LOKASI
  { slug: "lokasi/gudang-zone-rak", moduleGroup: "Lokasi", title: "Buat gudang, zone, rak", route: "/dashboard/lokasi", content: g(lokasiGudangZoneRak) },
  { slug: "lokasi/bulk-assign", moduleGroup: "Lokasi", title: "Bulk-assign rak ke zone", route: "/dashboard/lokasi", content: g(lokasiBulkAssign) },
  { slug: "lokasi/deactivate", moduleGroup: "Lokasi", title: "Deactivate lokasi", route: "/dashboard/lokasi", content: g(lokasiDeactivate) },

  // KATEGORI & MEREK
  { slug: "kategori-merek/dasar", moduleGroup: "Kategori & Merek", title: "Mengelola kategori (tree) & merek", route: "/dashboard/kategori-merek/kategori", content: g(kategoriMerek) },

  // KONTAK
  { slug: "kontak/pelanggan", moduleGroup: "Kontak", title: "Kontak Pelanggan (import/export, phone E.164)", route: "/dashboard/kontak-pelanggan", content: g(kontakPelanggan) },
  { slug: "kontak/pemasok", moduleGroup: "Kontak", title: "Kontak Pemasok", route: "/dashboard/kontak-pemasok", content: g(kontakPemasok) },

  // INTEGRASI CHANNEL
  { slug: "integrasi-channel/koneksi", moduleGroup: "Integrasi Channel", title: "Ringkasan koneksi channel", route: "/dashboard/integrasi-channel", content: g(integrasiKoneksi) },
  { slug: "integrasi-channel/shopee", moduleGroup: "Integrasi Channel", title: "Connect Shopee (OAuth)", route: "/dashboard/integrasi-channel", content: g(integrasiShopee) },
  { slug: "integrasi-channel/lazada", moduleGroup: "Integrasi Channel", title: "Connect Lazada (state 10 menit)", route: "/dashboard/integrasi-channel", content: g(integrasiLazada) },
  { slug: "integrasi-channel/tiktok", moduleGroup: "Integrasi Channel", title: "Connect TikTok Shop", route: "/dashboard/integrasi-channel", content: g(integrasiTikTok) },
  { slug: "integrasi-channel/woocommerce", moduleGroup: "Integrasi Channel", title: "Connect WooCommerce (Basic Auth)", route: "/dashboard/integrasi-channel", content: g(integrasiWooCommerce) },
  { slug: "integrasi-channel/refresh-token", moduleGroup: "Integrasi Channel", title: "Refresh token yang expired", route: "/dashboard/integrasi-channel", content: g(integrasiRefreshToken) },
  { slug: "integrasi-channel/toggle-sync", moduleGroup: "Integrasi Channel", title: "Toggle sync per fitur", route: "/dashboard/integrasi-channel", content: g(integrasiToggleSync) },

  // TOKO INTERNAL
  { slug: "toko-internal/setup", moduleGroup: "Toko Internal", title: "Setup toko internal (POS/offline)", route: "/dashboard/toko-internal", content: g(tokoInternalSetup) },

  // RETUR
  { slug: "retur/terima-retur", moduleGroup: "Retur", title: "Terima retur channel", route: "/dashboard/barang-masuk/retur", content: g(returTerima) },
  { slug: "retur/retur-manual", moduleGroup: "Retur", title: "Retur manual", route: "/dashboard/barang-masuk/retur", content: g(returManual) },
  { slug: "retur/laporan-bulanan", moduleGroup: "Retur", title: "Laporan retur bulanan", route: "/dashboard/laporan/retur", content: g(returLaporan) },

  // PEMBELIAN
  { slug: "pembelian/buat-po", moduleGroup: "Pembelian", title: "Buat Purchase Order", route: "/dashboard/transaksi-pembelian", content: g(pembelianBuatPo) },
  { slug: "pembelian/approval", moduleGroup: "Pembelian", title: "Approval PO", route: "/dashboard/transaksi-pembelian", content: g(pembelianApproval) },
  { slug: "pembelian/po-bayar", moduleGroup: "Pembelian", title: "PO → Penerimaan → Bayar", route: "/dashboard/transaksi-pembelian", content: g(pembelianPoBayar) },

  // PERMINTAAN RESTOCK
  { slug: "permintaan-restock/request", moduleGroup: "Permintaan Restock", title: "Request restock antar cabang", route: "/dashboard/permintaan-restock", content: g(permintaanRestockRequest) },

  // LAPORAN
  { slug: "laporan/daftar", moduleGroup: "Laporan", title: "Daftar laporan yang tersedia", route: "/dashboard/laporan/persediaan", content: g(laporanDaftar) },
  { slug: "laporan/filter-export", moduleGroup: "Laporan", title: "Filter, periode, export", route: "/dashboard/laporan/persediaan", content: g(laporanFilterExport) },
  { slug: "laporan/paste-ai", moduleGroup: "Laporan", title: "Cara paste laporan ke AI", content: g(laporanPasteAi) },

  // NOTIFIKASI
  { slug: "notifikasi/bell", moduleGroup: "Notifikasi", title: "Bell icon, filter, mark read", route: "/dashboard/notifikasi", content: g(notifikasiBell) },
  { slug: "notifikasi/kanal", moduleGroup: "Notifikasi", title: "Kanal notifikasi (in-app, WA, email)", route: "/dashboard/notifikasi", content: g(notifikasiKanal) },

  // IMPEX
  { slug: "impex/status", moduleGroup: "Aktivitas Impex", title: "Cek status import/export", route: "/dashboard/aktivitas-impex", content: g(impexStatus) },
  { slug: "impex/download", moduleGroup: "Aktivitas Impex", title: "Download hasil / error log", route: "/dashboard/aktivitas-impex", content: g(impexDownload) },

  // PENGATURAN
  { slug: "pengaturan/umum", moduleGroup: "Pengaturan", title: "Pengaturan Umum (identitas, kebijakan, SLA)", route: "/dashboard/pengaturan", content: g(pengaturanUmum) },
  { slug: "pengaturan/pengguna", moduleGroup: "Pengaturan", title: "Pengguna (invite, edit, deactivate)", route: "/dashboard/pengaturan/pengguna", content: g(pengaturanPengguna) },
  { slug: "pengaturan/rbac", moduleGroup: "Pengaturan", title: "Peran / RBAC (matriks izin)", route: "/dashboard/pengaturan/peran", content: g(pengaturanRbac) },
  { slug: "pengaturan/persediaan", moduleGroup: "Pengaturan", title: "Pengaturan Persediaan (alokasi, safety stock)", route: "/dashboard/pengaturan-persediaan", content: g(pengaturanPersediaan) },

  // PROFIL SAYA
  { slug: "profil-saya/tab-profil", moduleGroup: "Profil Saya", title: "Tab Profil (nama, HP, email, foto)", route: "/dashboard/profil-saya", content: g(profilTabProfil) },
  { slug: "profil-saya/keamanan", moduleGroup: "Profil Saya", title: "Tab Keamanan (password, 2FA)", route: "/dashboard/profil-saya", content: g(profilKeamanan) },
  { slug: "profil-saya/sesi-riwayat", moduleGroup: "Profil Saya", title: "Tab Sesi & Riwayat", route: "/dashboard/profil-saya", content: g(profilSesiRiwayat) },
  { slug: "profil-saya/preferensi", moduleGroup: "Profil Saya", title: "Tab Preferensi", route: "/dashboard/profil-saya", content: g(profilPreferensi) },

  // STANDAR CROSS-CUTTING
  { slug: "standar/search", moduleGroup: "Standar Umum", title: "Cara pakai search & filter (Spatie Query Builder)", content: g(standarSearch) },
  { slug: "standar/tabel", moduleGroup: "Standar Umum", title: "Cara pakai tabel: sort, pagination, kolom", content: g(standarTabel) },
  { slug: "standar/scan", moduleGroup: "Standar Umum", title: "Standar Scan Autoflow", content: g(standarScan) },
  { slug: "standar/user-select", moduleGroup: "Standar Umum", title: "UserSelect (search API + Saya sendiri)", content: g(standarUserSelect) },
  { slug: "standar/phone", moduleGroup: "Standar Umum", title: "PhoneInput (E.164)", content: g(standarPhone) },
  { slug: "standar/kembali", moduleGroup: "Standar Umum", title: "Tombol Kembali & breadcrumb (pertahankan posisi)", content: g(standarKembali) },
];

export const MANUAL_GROUPS = Array.from(new Set(MANUAL_ENTRIES.map((e) => e.moduleGroup)));
