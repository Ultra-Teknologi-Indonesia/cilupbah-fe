export const kategoriMerek = `## Kategori dan Merek Produk

![Mengelola kategori (tree) & merek](/bantuan/media/routes/dashboard-kategori-merek-kategori/01-halaman.png "Mengelola kategori (tree) & merek")

Modul **Kategori & Merek** (\`/dashboard/kategori-merek\`) mengatur klasifikasi produk yang menjadi acuan filter di modul **Produk**, **Posisi Stok**, dan **Laporan**.

### Kategori (tree)

1. Buka tab **Kategori** dan klik **Tambah Kategori**.
2. Isi \`name\` dan pilih **Parent** bila kategori ini merupakan sub-kategori (kosongkan untuk kategori root).
3. Klik **Simpan**. Kategori baru muncul pada pohon di kolom kiri.
4. Struktur mendukung **unlimited depth**, misal \`Fashion > Pakaian > Kaos > Kaos Anak\`.
5. Drag-and-drop node untuk menyusun ulang parent-child.

### Merek (flat)

1. Buka tab **Merek** dan klik **Tambah Merek**.
2. Isi \`name\` dan (opsional) upload logo.
3. Klik **Simpan** untuk menambahkan ke daftar.
4. Struktur bersifat flat; tidak ada hierarki parent-child untuk merek.

### Pemakaian di modul lain

- Kategori & merek dipakai sebagai filter di daftar **Produk** dan **Posisi Stok**.
- Laporan penjualan dapat digrupkan berdasarkan kategori root atau leaf.

### Catatan hapus

> Kategori atau merek **tidak dapat dihapus** bila masih dipakai oleh varian produk aktif. Nonaktifkan varian terlebih dahulu atau pindahkan ke kategori/merek lain sebelum menghapus.

- Menghapus kategori parent yang memiliki child akan gagal; hapus child terlebih dahulu atau pindahkan.
- Perubahan nama kategori berlaku langsung ke seluruh produk yang menggunakannya.

### Shortcut

- \`N\` untuk **Tambah** pada tab aktif (Kategori atau Merek).
- \`/\` untuk fokus ke kotak pencarian.
`;
