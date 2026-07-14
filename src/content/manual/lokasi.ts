export const lokasiGudangZoneRak = `## Struktur Lokasi: Gudang, Zona, dan Rak

![Buat gudang, zone, rak](/bantuan/media/routes/dashboard-lokasi/01-halaman.png "Buat gudang, zone, rak")

Hierarki lokasi di Cilupbah SuperApp terdiri dari tiga level: **Gudang** (Location) → **Zona** (LocationZone) → **Rak** (LocationBin). Struktur ini menjadi acuan seluruh transaksi stok.

### Langkah pembuatan

1. Buka menu **Lokasi > Gudang** (\`/dashboard/lokasi\`) lalu klik **Tambah Gudang**.
2. Isi \`code\`, \`name\`, alamat, dan tipe (Pusat, Cabang, Ruko, atau Transit sistem).
3. Buka tab **Zona** pada halaman detail gudang, lalu klik **Tambah Zona** untuk memisahkan area (mis. \`ZONA-A\`, \`ZONA-B\`).
4. Buka tab **Rak** dan klik **Tambah Rak** untuk membuat rak dengan \`bin_final_code\` (mis. \`A-01-03\`).
5. Assign rak ke zona pada langkah 3 atau lewat bulk-assign di menu **Rak > Kelola Zona**.

### Catatan penting

> Field \`max_qty\` per rak **SUDAH DIHAPUS** sejak rilis 07-08. Sistem tidak lagi memvalidasi kapasitas rak. Batasan fisik rak menjadi tanggung jawab operasional gudang.

- \`bin_final_code\` bersifat unik per gudang dan menjadi label yang dipindai saat scan.
- Rak dapat ditandai sebagai **Rak Inbound** untuk penerimaan sementara sebelum putaway.
- Rak bertipe **SYS-TRANSIT** dibuat otomatis oleh sistem, jangan diedit manual.

### Shortcut

- \`N\` di halaman daftar rak untuk membuka form **Tambah Rak** cepat.
`;

export const lokasiBulkAssign = `## Bulk Assign Rak ke Zona

![Bulk-assign rak ke zone](/bantuan/media/routes/dashboard-lokasi/01-halaman.png "Bulk-assign rak ke zone")

**LocationZone** menjadi surface untuk memisahkan rak fisik yang berbeda gedung, misalnya rak di **Gudang Pusat** vs rak yang dititip di **Ruko** sekalipun secara Location masih satu unit.

### Langkah bulk-assign

1. Buka menu **Lokasi > Zona** pada gudang terkait.
2. Buat zona jika belum ada, misal \`PUSAT\` dan \`RUKO\`.
3. Klik tombol **Kelola Rak** pada baris zona tujuan.
4. Centang rak-rak yang ingin dipindahkan ke zona tersebut (bisa gunakan **Pilih Semua** setelah menerapkan filter).
5. Klik **Assign ke Zona** untuk menyimpan.

### Efek pada modul lain

- Halaman **Posisi Stok** dapat memecah kolom lokasi berdasarkan zona (lihat toggle **Tampilkan per Zona**).
- Halaman **Penempatan** menampilkan zona sebagai pengelompok saat memilih rak tujuan.
- Laporan berbasis zona muncul di menu **Laporan > Stok per Zona**.

### Catatan

> Satu rak hanya boleh berada pada satu zona. Memindah rak ke zona baru otomatis melepas dari zona sebelumnya.

- Rak tanpa zona tetap valid dan muncul dalam grup **Tanpa Zona**.
- Perubahan zona tidak memindahkan stok fisik; hanya label pengelompok.
`;

export const lokasiDeactivate = `## Menonaktifkan Lokasi

![Deactivate lokasi](/bantuan/media/routes/dashboard-lokasi/01-halaman.png "Deactivate lokasi")

Gudang atau rak yang tidak lagi digunakan sebaiknya **dinonaktifkan**, bukan dihapus, untuk menjaga integritas riwayat movement dan laporan historis.

### Langkah deactivate

1. Buka menu **Lokasi > Gudang** lalu klik gudang yang ingin dinonaktifkan.
2. Klik tombol **Nonaktifkan** di kanan atas halaman detail.
3. Sistem melakukan pre-check: memastikan tidak ada picklist, transfer, atau putaway aktif.
4. Konfirmasi pada dialog yang muncul.
5. Untuk rak, buka tab **Rak**, pilih baris, lalu klik **Nonaktifkan Terpilih**.

### Efek deactivate

- Lokasi tidak muncul di dropdown pemilihan pada modul Penempatan, Transfer, dan Sales.
- Stok pada \`inventories\` **tetap** tercatat; kolom \`on_hand\` tidak di-nol-kan.
- Movement historis tetap dapat ditelusuri di menu **Transaksi Stok**.
- Laporan **Posisi Stok** menyembunyikan lokasi nonaktif kecuali toggle **Tampilkan Nonaktif** diaktifkan.

### Catatan

> Anda **tidak dapat** menghapus lokasi yang pernah memiliki movement. Sistem hanya mengizinkan hapus penuh untuk lokasi yang belum pernah dipakai transaksi apa pun.

- Lokasi bertipe **SYS-TRANSIT** tidak dapat dinonaktifkan.
- Reactivate lewat tombol **Aktifkan Kembali** pada halaman detail.
`;
