export const onboardingLoginAktivasi = `## Aktivasi Akun & Login Pertama

Setelah admin menerbitkan akun untuk Anda, sistem mengirim email berisi tautan aktivasi yang berlaku 7 hari. Anda wajib menyelesaikan aktivasi sebelum masa berlaku habis, karena tautan yang kedaluwarsa harus di-request ulang ke admin.

### Langkah aktivasi

1. Buka email dengan subjek **"Aktivasi Akun Cilupbah SuperApp"** dari alamat resmi tim. Periksa folder Spam bila tidak muncul di Inbox.
2. Klik tombol **Aktivasi Akun** di badan email. Anda akan diarahkan ke halaman \`/aktivasi/[token]\`.
3. Isi field **Password Baru** dan **Konfirmasi Password** (minimal 10 karakter, kombinasi huruf besar-kecil, angka, dan simbol). Sistem menolak password yang pernah bocor di database publik.
4. Klik **Aktivasi & Masuk**. Sistem otomatis membuat sesi login dan mengarahkan Anda ke \`/dashboard\`.

### Verifikasi kontak

1. Buka \`/dashboard/profil-saya\` tab **Profil**, cek badge di sebelah field \`email\` dan \`phone\`.
2. Bila belum **Terverifikasi**, klik **Kirim Kode OTP**. Kode 6 digit dikirim ke email/HP dan berlaku 5 menit.
3. Masukkan kode pada dialog verifikasi, lalu klik **Verifikasi**. Badge berubah menjadi hijau **Terverifikasi**.

> Nomor HP wajib format E.164 (mis. \`+6281234567890\`). Tanpa verifikasi HP, notifikasi OTP dan reset password tidak dapat dikirim ke WhatsApp.

Shortcut: tekan \`Ctrl/Cmd + K\` di dashboard mana pun untuk membuka Command Palette dan cari "profil saya".
`;

export const onboardingTurCepat = `## Tur Cepat Sidebar & Layout Dashboard

Layout dashboard dirancang seragam di seluruh modul sehingga Anda dapat berpindah menu tanpa kehilangan orientasi. Pahami empat area utama berikut sebelum mulai bekerja.

### Sidebar kiri

1. **Sidebar** menampung grup menu: Beranda, Pesanan, Proses Pesanan, Produk, Persediaan, Pembelian, Transaksi Stok, Laporan, Pengaturan.
2. Setiap item hanya tampil jika role Anda memiliki izin (RBAC Spatie). Bila menu hilang, hubungi admin untuk cek matriks Hak Akses.
3. Sidebar dapat diciutkan menjadi ikon-only via tombol chevron di header sidebar. Preferensi tersimpan di localStorage per browser.
4. Sub-menu aktif ditandai border kiri berwarna primary; grup akan otomatis mengembang saat rute anaknya aktif.

### Header, PageTitle, Breadcrumb

1. **PageTitle** di puncak konten menampilkan judul halaman, deskripsi singkat, dan slot aksi kanan (mis. tombol **Tambah Pesanan**). Aksi wajib berada di header, bukan di footer card.
2. **Breadcrumb** tepat di atas PageTitle menunjukkan jejak navigasi (mis. Pesanan > Detail > PES-000123). Klik segmen untuk kembali dengan mempertahankan tab/filter/scroll asal.
3. **Bell notifikasi** di kanan header menampilkan daftar pemberitahuan real-time (webhook gagal, retur baru, resi tertunda). Klik item untuk membuka detail terkait.
4. **Avatar menu** menyimpan tautan **Profil Saya**, **Ganti Perusahaan** (bila multi-tenant), dan **Keluar**.

> Tombol **Kembali** di detail selalu memakai \`router.back()\` dengan fallback ke daftar induk, sehingga URL query (tab, search, page) tetap terjaga.

Shortcut: \`g\` lalu \`p\` melompat ke Pesanan; \`g\` lalu \`s\` ke Proses Pesanan; \`?\` menampilkan seluruh pintasan.
`;

export const onboardingSetupProfil = `## Setup Profil Saya (4 Tab)

Halaman \`/dashboard/profil-saya\` adalah pusat pengaturan akun personal Anda. Selesaikan keempat tab sebelum mulai memakai modul operasional agar audit trail dan notifikasi berjalan benar.

### Tab Profil

1. Isi \`nama_lengkap\`, \`jabatan\`, dan unggah foto (rasio 1:1, maksimal 2 MB, format JPG/PNG/WebP).
2. Verifikasi \`email\` dan \`phone\` (wajib E.164, mis. \`+6281234567890\`) via tombol **Kirim OTP**.
3. Klik **Simpan Perubahan** di footer card. Perubahan langsung tercermin di avatar header.

### Tab Keamanan

1. Ganti password melalui form **Ubah Password**: masukkan password lama, baru, dan konfirmasi.
2. Aktifkan **Two-Factor Authentication (2FA)** dengan scan QR di aplikasi Authenticator, lalu masukkan 6 digit kode untuk konfirmasi.
3. Simpan **Recovery Codes** yang muncul sekali saja — kode ini menyelamatkan akses bila kehilangan perangkat 2FA.

### Tab Sesi & Riwayat

1. Daftar sesi aktif menampilkan device, IP, lokasi kasar, dan waktu login terakhir.
2. Klik **Keluarkan** pada sesi yang mencurigakan; sesi aktif Anda saat ini ditandai badge **Sesi Ini**.
3. Riwayat login 30 hari terakhir tersedia dalam tabel yang dapat diekspor CSV.

### Tab Preferensi

1. Atur bahasa antarmuka (ID/EN), zona waktu default, dan format tanggal.
2. Aktifkan atau matikan notifikasi per kanal: **Email**, **WhatsApp**, **In-app Bell**.
3. Pilih halaman awal saat login: Beranda dashboard atau modul favorit (mis. Proses Pesanan).

> Setiap perubahan tersimpan per user, bukan per perusahaan. Preferensi tidak berlaku bagi user lain di tenant yang sama.
`;
