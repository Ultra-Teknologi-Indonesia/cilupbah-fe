export const posisiStokBaca = `## Membaca Posisi Stok

Halaman **Posisi Stok** (\`/dashboard/posisi-stok\`) menampilkan snapshot stok setiap SKU secara berdampingan per lokasi sehingga Anda dapat membandingkan ketersediaan antar gudang tanpa berpindah tab.

### Langkah membaca kolom

1. Buka menu **Posisi Stok** pada sidebar kiri.
2. Setiap lokasi aktif ditampilkan sebagai grup kolom dengan 4 metrik: \`on_hand\`, \`reserved\`, \`available\`, dan \`sellable\`.
3. Kolom paling kanan adalah **Total** yang menjumlahkan seluruh lokasi terpilih.
4. Klik header kolom untuk mengurutkan berdasarkan metrik tersebut.
5. Gunakan kolom **SKU** yang sticky untuk tetap melihat identitas varian saat men-scroll horizontal.

### Catatan penting

> Lokasi bertipe **Transit** (SYS-TRANSIT) sengaja dikecualikan dari perhitungan agar angka \`sellable\` tidak menggelembung oleh stok yang sedang berjalan antar gudang.

- Nilai \`available\` = \`on_hand\` - \`reserved\`.
- Nilai \`sellable\` mengikuti kebijakan channel (dapat lebih kecil dari \`available\` jika ada buffer per marketplace).
- Baris berwarna merah menandakan salah satu lokasi memiliki \`on_hand\` negatif dan wajib direview.

### Shortcut

- \`/\` untuk fokus ke kotak pencarian SKU.
- \`Shift + R\` untuk refresh data tanpa reload halaman.
`;

export const posisiStokToggleLokasi = `## Mengatur Lokasi yang Ditampilkan

Anda dapat memilih lokasi mana saja yang muncul di tabel **Posisi Stok** untuk fokus pada gudang tertentu.

### Langkah pengaturan

1. Klik tombol **Lokasi** pada toolbar di kanan atas tabel.
2. Centang atau hapus centang lokasi yang ingin ditampilkan.
3. Klik **Terapkan** untuk menyimpan pilihan.
4. Pilihan tersimpan otomatis di \`localStorage\` browser sehingga akan sama saat Anda buka halaman berikutnya.
5. Klik **Reset** untuk kembali ke daftar lokasi default (seluruh lokasi aktif).

### Sub-lokasi rak (LocationZone)

Rak fisik dapat dikelompokkan dalam **LocationZone** untuk memisahkan area Gudang Pusat vs Ruko. Zona muncul sebagai kolom pengelompok di atas nama rak.

- Aktifkan toggle **Tampilkan per Zona** untuk memecah kolom lokasi menjadi kolom zona.
- Rak tanpa zona akan masuk ke grup **Tanpa Zona**.

### Catatan tampilan

> Kolom sticky (SKU dan Nama Produk) menggunakan background \`bg-background\` opaque agar tidak transparan saat baris di belakangnya di-scroll.

- Kolom \`Total\` selalu berada di paling kanan dan tidak dapat disembunyikan.
- Preferensi Lokasi bersifat per-user per-browser, bukan per-akun global.
`;

export const posisiStokExport = `## Ekspor Posisi Stok

Ekspor XLSX berguna untuk audit stok bulanan, rekonsiliasi manual, atau berbagi snapshot dengan tim keuangan.

### Langkah ekspor

1. Terapkan filter yang Anda inginkan (kategori, merek, lokasi, pencarian SKU).
2. Klik tombol **Ekspor** di kanan atas halaman **Posisi Stok**.
3. Pilih format **XLSX**, lalu klik **Mulai Ekspor**.
4. Sistem memproses ekspor secara asinkron; Anda dapat melanjutkan pekerjaan lain sambil menunggu.
5. Setelah selesai, notifikasi bell akan berbunyi dan file dapat diunduh dari halaman **Aktivitas Impex** (\`/dashboard/aktivitas-impex\`).

### Isi file ekspor

- Seluruh kolom yang tampak di layar saat Anda menekan **Ekspor** ikut tereksport, termasuk filter aktif.
- Baris pertama berisi metadata filter (periode ekspor, lokasi terpilih, pengguna).
- Kolom \`on_hand\`/\`reserved\`/\`available\`/\`sellable\` per lokasi tetap berdampingan seperti di tabel.

### Catatan

> Riwayat setiap ekspor tersimpan di **Aktivitas Impex** selama 30 hari. Setelah itu file dihapus otomatis; unduh segera bila diperlukan sebagai arsip.

- File besar (>50.000 baris) akan dipecah otomatis menjadi beberapa sheet.
- Ekspor tidak menyertakan lokasi **Transit** karena tidak ada di tampilan tabel.
`;
