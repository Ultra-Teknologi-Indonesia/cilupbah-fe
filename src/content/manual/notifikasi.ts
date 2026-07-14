export const notifikasiBell = `## Notifikasi Bell

![Bell icon, filter, mark read](/bantuan/media/routes/dashboard-notifikasi/01-halaman.png "Bell icon, filter, mark read")

Bell icon di header aplikasi adalah pusat notifikasi real-time untuk peristiwa yang relevan dengan peran Anda.

### Langkah membuka notifikasi

1. Klik ikon **lonceng** di kanan atas header (\`/dashboard/notifikasi\` untuk halaman penuh).
2. Angka **badge** di lonceng menunjukkan jumlah notifikasi belum dibaca.
3. Panel dropdown menampilkan 10 notifikasi terbaru; klik **Lihat Semua** untuk halaman penuh.
4. Klik item untuk melompat ke sumber notifikasi (mis. order, retur, atau pengaturan).

### Filter kategori

- **Sistem** — maintenance, kegagalan sync besar, kegagalan job impex.
- **Pesanan** — order baru masuk, order gagal proses, order dibatalkan customer.
- **Sync** — sukses/gagal push stok ke channel, penarikan produk baru.
- **Retur** — retur baru masuk, keputusan \`dispute_outcome\` final.

### Aksi bulk

1. Klik **Tandai Dibaca** pada item tunggal untuk menghilangkan indikator titik.
2. Klik **Tandai Semua Dibaca** di header panel untuk reset badge ke 0.
3. Gunakan filter kategori sebelum mark-all agar tidak menutup notifikasi kategori lain.

> Notifikasi retensi 90 hari. Setelah lewat, notifikasi dipindah ke arsip dan hanya dapat diakses via **Aktivitas Impex** (kategori Sistem) atau riwayat modul terkait.

### Shortcut

- \`N\` (tanpa modifier) untuk buka/tutup panel notifikasi dari mana saja.
`;

export const notifikasiKanal = `## Kanal & Preferensi Notifikasi

![Kanal notifikasi (in-app, WA, email)](/bantuan/media/routes/dashboard-notifikasi/01-halaman.png "Kanal notifikasi (in-app, WA, email)")

Notifikasi dapat dikirim melalui beberapa kanal sesuai preferensi Anda dan konfigurasi role.

### Kanal yang didukung

- **In-app** — muncul di bell dan halaman \`/dashboard/notifikasi\`; selalu aktif, tidak dapat dinonaktifkan.
- **WhatsApp** — pesan ke nomor \`user.phone\` (format E.164) melalui gateway resmi.
- **Email** — kirim ke \`user.email\`; ideal untuk digest harian dan laporan besar.

### Langkah mengatur preferensi

1. Buka **Profil Saya > Preferensi** (\`/dashboard/profil-saya?tab=preferensi\`).
2. Scroll ke section **Notifikasi**.
3. Untuk setiap topic (Pesanan/Sync/Retur/Sistem), centang kanal yang diinginkan.
4. Klik **Simpan** — perubahan berlaku pada notifikasi berikutnya.

### Broadcast per role

- Admin dapat mengatur kanal **default per role** di **Pengaturan > Pengguna & Peran**.
- Notifikasi kritikal (mis. stok minus > 3 hari) tetap terkirim ke role Manager Gudang meskipun user mematikan kanal.

> Kanal WhatsApp memerlukan nomor terverifikasi. Bila nomor Anda belum tervalidasi, sistem akan mengirimkan OTP dari **Profil Saya > Profil** sebelum kanal aktif.

- Preferensi user selalu menang atas default role, kecuali untuk kategori Sistem yang bersifat mandatori.
- Untuk mengurangi noise, aktifkan mode **Digest Harian** — semua notifikasi non-kritikal dikirim 1x jam 08:00 WIB.
`;
