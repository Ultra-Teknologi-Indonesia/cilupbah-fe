export const kontakPelanggan = `## Kontak Pelanggan

Modul **Kontak Pelanggan** (\`/dashboard/kontak-pelanggan\`) menyimpan data pelanggan yang menjadi acuan **Tambah Pesanan** manual, invoicing, dan pengiriman.

### Langkah tambah pelanggan

1. Buka menu **Kontak Pelanggan** lalu klik **Tambah Pelanggan**.
2. Isi \`name\` dan nomor telepon menggunakan komponen **PhoneInput** yang otomatis mem-format ke standar **E.164** (mis. \`+628123456789\`).
3. Isi \`email\` (opsional) dan \`npwp\` bila pelanggan berbadan usaha.
4. Pada bagian **Alamat**, isi provinsi/kota/kecamatan lewat combobox, alamat detail, dan **pin map** untuk mengisi \`shipping_coordinate\` (\`lat\`, \`lng\`).
5. Klik **Simpan** untuk membuat kontak; kontak baru langsung tersedia di **Tambah Pesanan**.

### Import / Export XLSX

- Klik **Impor** untuk unggah XLSX massal. Unduh template terlebih dahulu untuk memastikan kolom sesuai.
- Klik **Ekspor** untuk mengunduh seluruh kontak dengan filter aktif; hasilnya tercatat di **Aktivitas Impex**.
- Kolom \`phone\` di file impor harus dalam format E.164 agar validasi lolos.

### Catatan

> Nomor telepon **wajib** dalam format E.164. Nomor tanpa kode negara akan ditolak oleh validasi \`lib/phone.ts\`. Pengecualian hanya untuk field \`shipping_phone\` yang berasal dari webhook marketplace.

- Pin map opsional, tapi sangat dianjurkan untuk kurir instan (Grab/Gojek).
- Pelanggan yang pernah dipakai pesanan tidak dapat dihapus, hanya dinonaktifkan.
`;

export const kontakPemasok = `## Kontak Pemasok

Modul **Kontak Pemasok** (\`/dashboard/kontak-pemasok\`) menyimpan data supplier yang menjadi acuan **Pesanan Pembelian** dan pembayaran ke vendor.

### Langkah tambah pemasok

1. Buka menu **Kontak Pemasok** lalu klik **Tambah Pemasok**.
2. Isi \`name\`, \`npwp\`, dan nomor telepon PIC melalui **PhoneInput** (format E.164).
3. Isi **PIC** (nama, jabatan, email, telepon) untuk kontak operasional.
4. Pilih **Termin Pembayaran**: \`COD\`, \`Net 30\`, \`Net 60\`, atau custom (isi hari).
5. Isi alamat lengkap dan (opsional) rekening bank untuk pembayaran.
6. Klik **Simpan**.

### Pemakaian di modul lain

- Muncul sebagai dropdown supplier di **Pesanan Pembelian** (\`/dashboard/transaksi-pembelian\`).
- Termin pembayaran otomatis menghitung \`due_date\` invoice pembelian.
- NPWP tampil di dokumen invoice/faktur pajak.

### Import / Export XLSX

- Impor/Ekspor bekerja sama seperti Kontak Pelanggan; hasil tercatat di **Aktivitas Impex**.
- Kolom \`payment_term_days\` menerima angka hari, atau kode \`COD\`.

### Catatan

> Struktur data Pemasok identik dengan Pelanggan (nama, telepon, email, alamat, NPWP), tetapi disimpan pada tabel terpisah dan tidak dapat dipertukarkan antar modul.

- Pemasok nonaktif tetap muncul di riwayat PO tetapi tidak dapat dipilih untuk PO baru.
- Ubah termin pembayaran hanya berlaku untuk PO baru; PO existing tidak berubah.
`;
