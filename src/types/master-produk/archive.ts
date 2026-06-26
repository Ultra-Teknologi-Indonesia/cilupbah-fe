import type { RawMasterItem } from "./product"

export interface RawArchivedItem extends RawMasterItem {
  archived_at: string | null
  archived_by: string | null
  archive_reason: string | null
}

export interface ArchivedProduct {
  itemGroupId: string
  itemName: string
  sku: string | null
  categoryName: string
  thumbnail: string | null
  totalVariants: number
  archivedAt: string | null
  archivedBy: string | null
  archiveReason: string | null
}
