export const impexStatus = `## Status Job Impor/Ekspor

![Cek status import/export](/bantuan/media/routes/dashboard-aktivitas-impex/01-halaman.png "Cek status import/export")

Halaman **Aktivitas Impex** mencatat setiap pekerjaan impor dan ekspor yang Anda atau tim jalankan sehingga dapat dipantau progres dan hasilnya.

### Langkah membuka daftar job

1. Buka menu **Aktivitas Impex** (\`/dashboard/aktivitas-impex\`).
2. Tabel menampilkan kolom \`No\`, \`Jenis\` (Import/Export), \`Modul\`, \`Nama File\`, \`Status\`, \`Progress\`, \`Dijalankan Oleh\`, \`Waktu\`.
3. Gunakan filter **Modul** (Produk/Pesanan/Kontak/Persediaan) untuk mempersempit list.
4. Gunakan filter **Status** untuk fokus ke job yang membutuhkan tindakan.

### Status yang mungkin

- **queued** — job masuk antrian, belum ada worker yang memprosesnya.
- **processing** — worker sedang mengeksekusi; kolom \`Progress\` menunjukkan persentase.
- **success** — job selesai tanpa error, hasil siap diunduh.
- **failed** — job berhenti karena error; error log tersedia.

### Progress bar

- Bar progres update real-time via polling 5 detik.
- Estimasi waktu selesai muncul untuk job > 100 baris.
- Job \`processing\` dengan progres 0% > 5 menit menandakan worker macet — hubungi admin sistem.

> Job impor **TIDAK** dapat dibatalkan setelah masuk state \`processing\`. Pastikan file sudah benar sebelum submit.

### Shortcut

- Klik nomor job untuk melihat detail konfigurasi & metadata submit.
`;

export const impexDownload = `## Unduh Hasil & Error Log

![Download hasil / error log](/bantuan/media/routes/dashboard-aktivitas-impex/01-halaman.png "Download hasil / error log")

Setiap job yang selesai (baik sukses maupun gagal) menyediakan artefak untuk diunduh.

### Langkah unduh hasil sukses

1. Buka **Aktivitas Impex** (\`/dashboard/aktivitas-impex\`).
2. Cari job dengan status **success**.
3. Klik tombol **Unduh Hasil** pada baris terkait — file XLSX/CSV terunduh.
4. Untuk job ekspor, file berisi data lengkap sesuai filter yang diterapkan saat submit.

### Langkah unduh error log

1. Cari job dengan status **failed**.
2. Klik tombol **Unduh Error Log** — file berisi kolom \`row\`, \`sku\`, \`field\`, \`error_message\`.
3. Buka file di Excel; setiap baris = satu baris input yang gagal beserta alasannya.
4. Perbaiki baris tersebut di file sumber, lalu submit ulang lewat modul asal (mis. **Produk > Impor**).

### Retry job gagal

1. Klik tombol **Retry** pada job \`failed\` untuk menjalankan ulang dengan konfigurasi yang sama.
2. Retry memakai file sumber yang sama — jika ingin ganti file, submit job baru dari modul asal.
3. Job retry mendapat nomor baru; job lama tetap tersimpan sebagai jejak audit.

> Artefak (hasil/error log) disimpan **30 hari**. Setelah itu file dihapus otomatis; ekspor ulang bila masih dibutuhkan.

- Job impor dengan >50% baris gagal otomatis di-rollback (semua baris valid ikut dibatalkan) untuk menjaga integritas data.
- Error log dapat langsung di-copy ke ChatGPT/Claude untuk saran perbaikan format.
`;
