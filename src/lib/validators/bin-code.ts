// Kode rak client berformat bebas (mis. IN-A1-K1-P1, O-C3-K1-X4, LX-BX-KX-TRANS,
// GK-14-K1-B1), sehingga TIDAK bisa dibedakan dari SKU lewat pola regex — SKU pun
// bisa berbentuk segmen ber-tanda-hubung (mis. 20D-BL-IP-13). Deteksi "ini kode rak"
// dilakukan dengan mencocokkan ke daftar kode rak yang diketahui, bukan format.

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
