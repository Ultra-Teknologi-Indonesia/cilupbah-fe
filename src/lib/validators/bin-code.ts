export const BIN_CODE_PATTERN = /^L\d+-B\d+-K\d+-R\d+$/i;

export function isBinCode(code: string): boolean {
  return BIN_CODE_PATTERN.test(code.trim());
}
