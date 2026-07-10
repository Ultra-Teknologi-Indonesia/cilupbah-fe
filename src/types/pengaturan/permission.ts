/**
 * Bentuk katalog Hak Akses dari backend `GET /permissions/catalog`
 * (mengikuti PermissionCatalog::matrix()). Dipakai untuk merender matriks
 * izin bergrup di halaman Peran & form Hak Akses pengguna.
 */

export interface PermissionActionCell {
  /** view | create | edit | delete | export | import */
  action: string;
  /** Label ID untuk header kolom (Lihat, Tambah, …). */
  label: string;
  /** Nama permission penuh, mis. "view-produk". */
  permission: string;
}

export interface PermissionExtra {
  permission: string;
  label: string;
}

export interface PermissionResource {
  key: string;
  label: string;
  actions: PermissionActionCell[];
  extras: PermissionExtra[];
}

export interface PermissionGroup {
  key: string;
  label: string;
  resources: PermissionResource[];
}
