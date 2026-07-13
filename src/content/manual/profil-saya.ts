export const profilTabProfil = `## Profil Saya - Tab Profil

Tab **Profil** memuat data identitas dasar Anda yang tampil di seluruh aplikasi (avatar, aktivitas log, chat internal).

### Langkah mengubah profil

1. Buka **Profil Saya** (\`/dashboard/profil-saya\`) — tab **Profil** aktif secara default.
2. Klik area **Foto** untuk unggah avatar baru.
3. Pilih file JPG/PNG maksimal **2 MB**, rasio 1:1 direkomendasikan.
4. Klik **Simpan Foto** — avatar terupdate di header dalam beberapa detik.

### Field yang dapat diubah

- \`nama\` — nama lengkap; tampil di komentar, log, dan notifikasi tim.
- \`hp\` — nomor telepon via **PhoneInput** (format E.164 otomatis); wajib bila mengaktifkan kanal WhatsApp.
- \`email\` — email login; perubahan memicu proses verifikasi ulang.

### Verifikasi ulang email

1. Bila mengubah \`email\`, sistem mengirim link verifikasi ke alamat baru.
2. Alamat baru **belum aktif** sampai user klik link (berlaku 24 jam).
3. Sampai verifikasi selesai, login tetap memakai email lama.
4. Bila link kedaluwarsa, buka lagi halaman dan klik **Kirim Ulang**.

> Perubahan \`hp\` **tidak** memicu verifikasi otomatis. Untuk mengaktifkan kanal WhatsApp, OTP dikirim terpisah saat toggle kanal WA di **Preferensi**.

### Catatan

- Nama dan foto sinkron ke tabel \`users\`; komentar historis ikut menampilkan nama terbaru.
- Untuk perubahan email domain perusahaan, koordinasi dengan Admin agar tidak terblok kebijakan email.
`;

export const profilKeamanan = `## Profil Saya - Tab Keamanan

Tab **Keamanan** mengelola kredensial dan lapisan otentikasi tambahan (2FA).

### Ganti password

1. Buka **Profil Saya > Keamanan** (\`/dashboard/profil-saya?tab=keamanan\`).
2. Isi \`Password Lama\`, \`Password Baru\`, \`Konfirmasi Password Baru\`.
3. Password wajib memenuhi rule: **minimum 8 karakter**, mengandung huruf & angka.
4. Klik **Simpan** — semua sesi aktif lain di-invalidate; login ulang diperlukan pada perangkat lain.

### Aktifkan 2FA (Two-Factor Authentication)

1. Scroll ke section **Two-Factor Authentication**, klik **Aktifkan 2FA**.
2. Buka aplikasi authenticator (**Google Authenticator** / **Authy** / **1Password**).
3. Scan QR code yang muncul di layar.
4. Masukkan 6-digit kode dari authenticator ke input konfirmasi.
5. Klik **Konfirmasi** — sistem menampilkan **recovery codes** 8 buah.
6. Simpan recovery codes di password manager (bukan di catatan biasa).

### Recovery codes

- Setiap code hanya dapat dipakai **1x** sebagai pengganti kode authenticator.
- Bila kehabisan atau curiga bocor, klik **Regenerate Recovery Codes**; kode lama dibatalkan semua.
- Simpan di lokasi berbeda dengan device authenticator (jangan sama-sama HP).

> Kehilangan authenticator + recovery codes = akun terkunci. Kontak Admin untuk reset 2FA yang memerlukan verifikasi identitas manual.

### Catatan

- 2FA menjadi mandatori untuk role **Admin** & **Manager Gudang** sesuai kebijakan.
- Login gagal 5x berturut-turut mengunci akun sementara 15 menit.
`;

export const profilSesiRiwayat = `## Profil Saya - Sesi & Riwayat

Tab ini memperlihatkan semua sesi login aktif Anda beserta riwayat aktivitas kritikal, berguna untuk deteksi akses tidak sah.

### Langkah review sesi

1. Buka **Profil Saya > Sesi & Riwayat** (\`/dashboard/profil-saya?tab=sesi\`).
2. Tabel **Sesi Aktif** menampilkan kolom \`device\`, \`browser\`, \`ip\`, \`lokasi geo\`, \`login_at\`, \`last_active\`.
3. Baris dengan badge **Sesi Ini** menandai perangkat yang sedang Anda gunakan.

### Logout perangkat lain

1. Klik tombol **Logout** pada baris sesi yang ingin dihentikan.
2. Konfirmasi dialog — sesi target di-invalidate seketika.
3. Untuk logout semua kecuali sesi ini, klik **Logout Semua Perangkat Lain** di header tabel.

### Riwayat aktivitas

- Tab **Riwayat** menampilkan 100 aktivitas terakhir: login, ganti password, aktivasi 2FA, ekspor data besar.
- Kolom \`ip\` dan \`geo\` membantu identifikasi akses mencurigakan.
- Klik baris untuk detail (user agent lengkap, endpoint API yang dipanggil).

> Jika Anda melihat sesi/aktivitas yang tidak dikenali, **segera** logout sesi tersebut, ganti password, dan hubungi Admin untuk audit lebih lanjut.

### Catatan

- Sesi tidak aktif > 14 hari kedaluwarsa otomatis.
- Data lokasi geo bersifat perkiraan berdasarkan IP; tidak akurat untuk VPN/mobile carrier.
`;

export const profilPreferensi = `## Profil Saya - Preferensi

Tab **Preferensi** mengatur tampilan dan perilaku aplikasi mengikuti selera Anda tanpa memengaruhi user lain.

### Langkah mengubah preferensi

1. Buka **Profil Saya > Preferensi** (\`/dashboard/profil-saya?tab=preferensi\`).
2. Halaman berisi kartu **Tampilan**, **Regional**, **Notifikasi**.
3. Ubah nilai yang diinginkan, klik **Simpan** per kartu.

### Tampilan & regional

- \`bahasa\` — pilih **Indonesia** (default) atau **English**; label UI berubah setelah reload.
- \`timezone\` — default **Asia/Jakarta** (WIB); timestamp di tabel & log mengikuti setting ini.
- \`format_tanggal\` — pilih \`DD/MM/YYYY\`, \`YYYY-MM-DD\`, atau \`DD MMM YYYY\`.
- Preferensi tampilan **kolom tabel** (visible/hidden) tersimpan otomatis per browser via localStorage.

### Preferensi notifikasi

1. Section **Notifikasi** menampilkan matriks **topic × kanal**.
2. Topic: **Pesanan**, **Sync**, **Retur**, **Sistem**.
3. Kanal: **In-app**, **WhatsApp**, **Email**.
4. Centang kombinasi yang diinginkan; kolom In-app tidak dapat dimatikan.
5. Klik **Simpan Preferensi Notifikasi**.

> Perubahan preferensi bahasa/timezone berpengaruh pada dokumen cetak (invoice, surat jalan) yang di-generate **setelah** simpan. Dokumen historis tetap pakai setting lama.

### Catatan

- Preferensi notifikasi bersifat opt-out; kategori **Sistem** kritikal tidak dapat dimatikan.
- Reset ke default via tombol **Kembalikan ke Default** di footer halaman.
`;
