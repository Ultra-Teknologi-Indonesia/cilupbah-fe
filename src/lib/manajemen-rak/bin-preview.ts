import type {
  BinPreviewItem,
  GenerateBinsPayload,
} from "@/types/manajemen-rak/location";

export const MAX_BIN_COMBINATIONS = 10000;

export function buildBinPreview(
  payload: GenerateBinsPayload,
): BinPreviewItem[] {
  const items: BinPreviewItem[] = [];

  const zoneCode = payload.zone_code.trim();
  for (let r = 1; r <= payload.qty_row; r++) {
    const rowCode = `${payload.row_code}${r}`;
    for (let c = 1; c <= payload.qty_column; c++) {
      const columnCode = `${payload.column_code}${c}`;
      for (let b = 1; b <= payload.qty_bin; b++) {
        const binCode = `${payload.bin_code}${b}`;
        items.push({
          floorCode: zoneCode,
          rowCode,
          columnCode,
          binCode,
          binFinalCode: [zoneCode, rowCode, columnCode, binCode]
            .filter(Boolean)
            .join("-"),
          isStockAcknowledged: true,
          isLargeBin: false,
        });
      }
    }
  }

  return items;
}

export function binCombinationCount(payload: GenerateBinsPayload): number {
  return payload.qty_row * payload.qty_column * payload.qty_bin;
}
