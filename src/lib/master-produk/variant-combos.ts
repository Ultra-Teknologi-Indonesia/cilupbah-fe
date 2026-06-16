// Util kombinasi varian — dipakai builder (form) & hidrasi edit agar KEY konsisten.

export type VarOption = { attributeId: number; value: string }

/** Cartesian dari nilai opsi tiap jenis varian (urut sesuai urutan jenis). */
export function buildCombos(
  types: { attributeId: number; values: string[] }[]
): VarOption[][] {
  if (types.length === 0) return []
  let acc: VarOption[][] = [[]]
  for (const t of types) {
    if (t.values.length === 0) return []
    acc = acc.flatMap((combo) =>
      t.values.map((v) => [...combo, { attributeId: t.attributeId, value: v }])
    )
  }
  return acc
}

export const comboKey = (opts: VarOption[]): string =>
  opts.map((o) => `${o.attributeId}:${o.value}`).join("|")

export const comboLabel = (opts: VarOption[]): string =>
  opts.map((o) => o.value).join(" / ")

export const skuPart = (s: string): string => s.replace(/[^A-Za-z0-9]+/g, "-")
