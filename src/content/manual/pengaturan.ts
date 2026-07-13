export const pengaturanUmum = `## Pengaturan Umum

Tab **Umum** adalah pusat konfigurasi tunggal untuk satu perusahaan, mencakup identitas, kebijakan stok, dan SLA operasional.

### Langkah mengakses

1. Buka menu **Pengaturan > Umum** (\`/dashboard/pengaturan?tab=umum\`).
2. Halaman terbagi menjadi tiga kartu: **Identitas Perusahaan**, **Kebijakan Stok**, dan **SLA Operasional**.

### Identitas perusahaan

- Field disimpan di tabel \`company_profile\`: \`logo\`, \`nama\`, \`npwp\`, \`alamat\`, \`telepon\`, \`email\`.
- Logo dipakai di header aplikasi, invoice, dan surat jalan; upload JPG/PNG max 500 KB, rasio 1:1.
- \`npwp\` divalidasi format 15/16 digit sesuai regulasi terbaru.
- Perubahan langsung berdampak pada dokumen cetak yang di-generate setelah simpan.

### Kebijakan stok

- Toggle **Allow Negative Stock** — bila aktif, modul Penempatan/Pengambilan/Transfer/Penyesuaian dapat menembus stok 0 (Sales tetap dilarang).
- Nilai default: **aktif** (sesuai kebijakan operasional).
- Nonaktifkan hanya bila tim gudang sudah disiplin scan; risiko: proses fisik terhambat validasi.

### SLA operasional

- Field di tabel \`general_settings\`: \`sla_picking_minutes\`, \`sla_packing_minutes\`, \`sla_shipping_hours\`.
- Nilai default: picking 60 menit, packing 30 menit, shipping 24 jam.
- Order yang melewati SLA ditandai badge merah di halaman **Proses Pesanan**.

> Perubahan pengaturan umum di-audit di tabel \`audit_logs\` dengan \`actor_id\` = user yang menyimpan. Jangan pinjam akun.

### Shortcut

- Klik **Simpan** di **FormFooter** kartu untuk menyimpan per section — perubahan section lain tidak ikut tersimpan.
`;

export const pengaturanPengguna = `## Pengaturan Pengguna

Modul ini mengelola user aplikasi, invitasi, peran, dan status aktif/nonaktif.

### Langkah CRUD pengguna

1. Buka **Pengaturan > Pengguna** (\`/dashboard/pengaturan?tab=pengguna\`).
2. Klik **Tambah Pengguna** untuk membuka dialog undangan.
3. Isi \`nama\`, \`email\`, pilih \`role\` (Spatie: Admin/Manager Gudang/Picker/Packer/Sales), klik **Kirim Undangan**.
4. Sistem mengirim email dengan link aktivasi berlaku **7 hari**.
5. User set password sendiri via link tersebut; akun aktif setelah pertama login.

### Edit peran

1. Cari user di tabel, klik ikon **Edit** pada baris.
2. Modal dialog muncul; ubah \`role\` via combobox.
3. Klik **Simpan** — perubahan berlaku pada login berikutnya user (session lama diperbarui via polling).

### Deactivate user

1. Klik menu **⋮** pada baris user, pilih **Nonaktifkan**.
2. User yang dinonaktifkan tidak dapat login; session aktif di-invalidate langsung.
3. Riwayat aktivitas tetap tersimpan sebagai jejak audit — user tidak dihapus fisik.

> **JANGAN** menonaktifkan user yang masih memiliki task **assigned** (picking/packing/putaway pending). Reassign dulu via halaman terkait, atau task akan stuck.

### Catatan

- Link aktivasi kedaluwarsa dapat di-regenerate: klik user berstatus **Pending**, tombol **Kirim Ulang Undangan**.
- Bulk import user tersedia via **Impor XLSX** untuk onboarding tim besar.
`;

export const pengaturanRbac = `## Pengaturan RBAC (Hak Akses)

Matriks hak akses berbasis kombinasi modul × aksi × role dengan opsi override per user untuk kasus khusus.

### Langkah mengubah matriks role

1. Buka **Pengaturan > Hak Akses** (\`/dashboard/pengaturan?tab=hak-akses\`).
2. Pilih tab **Per Role** — matriks menampilkan kolom modul (Produk/Pesanan/Persediaan/Retur/Laporan/dst) × baris role.
3. Untuk setiap sel, centang aksi yang diizinkan.
4. Klik **Simpan** — perubahan berlaku ke semua user role tersebut.

### Enam aksi standar

- \`view\` — akses baca halaman & data.
- \`create\` — buat entitas baru.
- \`edit\` — modifikasi entitas existing.
- \`delete\` — hapus/arsip entitas.
- \`export\` — download data via **Ekspor** atau API.
- \`approve\` — approval workflow (mis. approve transfer, approve refund).

### Override per user

1. Buka tab **Per User** — pilih user, muncul matriks yang sama.
2. Sel dengan warna berbeda menandakan override terhadap default role.
3. Klik **Reset ke Default Role** untuk menghapus semua override user tersebut.

> Enforcement dilakukan di **FE (hide/disable UI)** dan **BE (Gate/Policy Laravel)**. Jangan mengandalkan hanya salah satu — permission check ganda mencegah bypass via API langsung.

### Catatan

- Perubahan matriks di-audit lengkap di \`audit_logs\` (siapa mengubah apa kapan).
- Role \`Admin\` memiliki semua aksi ter-hardcode; matriksnya read-only.
`;

export const pengaturanPersediaan = `## Pengaturan Persediaan

Kebijakan persediaan mengatur perilaku default sistem terkait alokasi stok, gudang default, dan guard stok negatif per modul.

### Langkah membuka

1. Buka menu **Pengaturan Persediaan** (\`/dashboard/pengaturan-persediaan\`).
2. Halaman terdiri dari kartu: **Kebijakan Alokasi**, **Gudang Default**, **Guard Stok Negatif**.

### Kebijakan alokasi

- Default \`WH-KECIL\` (Gudang Kecil) untuk seluruh transaksi **Sales** — semua Picklist dibuat dari lokasi ini.
- Modul internal (Penempatan/Transfer/Penyesuaian) menghormati lokasi yang dipilih user.
- \`SYS-TRANSIT\` selalu dikecualikan dari perhitungan \`available\` untuk mencegah alokasi ganda.

### Gudang default putaway

- Set \`default_putaway_location_id\` — dipakai saat receiving PO/Transfer tidak menyertakan lokasi.
- Rekomendasi: pilih gudang penerima utama (biasanya Gudang Besar).
- Perubahan hanya berdampak ke inbound baru; inbound existing tetap pakai lokasi lama.

### Guard stok negatif per modul

- Toggle per modul: **Penempatan**, **Pengambilan**, **Transfer**, **Penyesuaian**, **Sales**.
- Guard aktif = validasi stok tegas (tolak jika akan menjadi < 0).
- Guard nonaktif = allow-negative — cocok untuk operasi darurat dengan asumsi koreksi menyusul.
- Modul **Sales** disarankan tetap aktif untuk mencegah oversell ke customer.

> Perubahan guard memerlukan konfirmasi dobel + password ulang karena berdampak langsung pada integritas stok. Lakukan hanya di jam operasional dengan tim on-call.

### Catatan

- SKU yang minus muncul di **Monitor Stok > Stok Minus** untuk review Manager Gudang.
- Setiap koreksi guard dicatat di \`audit_logs\` dan notifikasi broadcast ke role Admin.
`;
