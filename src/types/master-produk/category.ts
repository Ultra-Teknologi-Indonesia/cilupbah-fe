// Tipe kategori berjenjang (kategori → subkategori → jenis).

export interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
}

/** Kategori terpilih beserta jejak path-nya (untuk picker form). */
export interface SelectedCategory {
  id: string
  name: string
  path: string[]
}
