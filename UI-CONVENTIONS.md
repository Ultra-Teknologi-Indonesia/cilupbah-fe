# Konvensi UI — cilupbah-fe

> Tujuan: sekali belajar, ingat selamanya. Pakai komponen & istilah yang sama di semua modul.

## Komponen bersama (WAJIB dipakai, jangan bikin ad-hoc)

| Kebutuhan | Pakai | Jangan |
|---|---|---|
| Kartu / permukaan | `Surface` (`components/ui/surface.tsx`) | `LiquidGlass`/`Card`/`<div class="rounded-xl border">` baru |
| Badge status | `StatusBadge` (`components/dashboard/shared/status-badge.tsx`) + `lib/status.ts` | `STATUS_MAP` lokal / `<span class="rounded-full …">` |
| Pilih petugas (field `*_by`) | `UserSelect` (`components/dashboard/shared/user-select.tsx`) | input teks nama bebas |
| Scan item (picking/packing/putaway) | `ScanAutoflowBar` (`components/dashboard/shared/scan-autoflow-bar.tsx`) | input scan ad-hoc |
| Tabel data | `DataTable` (list interaktif) atau primitives `ui/table` (tabel display) | `<table>` mentah |
| List + filter + pagination | `ResourceListView` | rakit ulang toolbar/pagination |
| Form data-heavy | Halaman tersendiri (route) | Dialog besar |

## Kamus istilah tombol (konsisten)

| Maksud | Label baku | Contoh |
|---|---|---|
| Buka form buat **entitas/dokumen baru** | **"Buat <Entitas>"** | Buat Retur, Buat Penyesuaian, Buat Pengiriman |
| Tambah **baris/anak** ke dalam sesuatu | **"Tambah <Item>"** | Tambah Item, Tambah Refund |
| Commit form / simpan | **"Simpan"** (atau "Simpan Draft") | — |
| Transisi status | **kata kerja aksinya** | Setujui, Kirim, Terima, Selesaikan, Tolak, Batalkan, Pindahkan, Finalisasi |
| Hapus permanen | **"Hapus"** | — |
| Batalkan dokumen/proses (bukan hapus data) | **"Batalkan"** | Batalkan Transfer |
| Dialog konfirmasi | tombol utama = kata kerja aksi, sekunder = **"Batal"** | [Setujui] [Batal] |
| Navigasi | **"Kembali"** / **"Tutup"** | — |

**Aturan:** jangan campur "Tambah/Buat" untuk membuat dokumen (selalu "Buat"). "Tambah" hanya untuk menambah baris ke dokumen yang sedang dibuka. "Simpan" untuk commit, bukan "Tambah".

## Status → warna (terpusat)

Semua label & warna status berasal dari `lib/status.ts` lewat `<StatusBadge domain="…" status={x} />`. Jangan definisikan peta status per komponen. Bila ada domain/status baru, tambahkan di `lib/status.ts` (satu sumber).
