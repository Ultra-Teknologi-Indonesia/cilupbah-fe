import type { BinPreviewItem, GenerateBinsPayload } from "@/types/manajemen-rak/location"

export const MAX_BIN_COMBINATIONS = 2000

// Hasilkan kombinasi kode rak secara lokal (mirror massGenerate di BE):
// floor "L1", row "B1", column "K1", bin "R1" -> final "L1-B1-K1-R1".
export function buildBinPreview(payload: GenerateBinsPayload): BinPreviewItem[] {
  const items: BinPreviewItem[] = []
  const maxQty = payload.max_qty ?? 0

  for (let f = 1; f <= payload.qty_floor; f++) {
    const floorCode = `${payload.floor_code}${f}`
    for (let r = 1; r <= payload.qty_row; r++) {
      const rowCode = `${payload.row_code}${r}`
      for (let c = 1; c <= payload.qty_column; c++) {
        const columnCode = `${payload.column_code}${c}`
        for (let b = 1; b <= payload.qty_bin; b++) {
          const binCode = `${payload.bin_code}${b}`
          items.push({
            floorCode,
            rowCode,
            columnCode,
            binCode,
            binFinalCode: [floorCode, rowCode, columnCode, binCode].join("-"),
            maxQty,
          })
        }
      }
    }
  }

  return items
}

export function binCombinationCount(payload: GenerateBinsPayload): number {
  return payload.qty_floor * payload.qty_row * payload.qty_column * payload.qty_bin
}
