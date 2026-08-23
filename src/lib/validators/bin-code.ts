export function matchesKnownBin(
  code: string,
  knownBins: Iterable<string | null | undefined>,
): boolean {
  const c = code.trim().toUpperCase();
  if (!c) return false;
  for (const bin of knownBins) {
    if (bin && bin.trim().toUpperCase() === c) return true;
  }
  return false;
}
