export const UNASSIGN_REASON_CODES = [
  "SALAH_TAP",
  "SHIFT_HABIS",
  "SAKIT",
  "KENDALA_TEKNIS",
  "LAINNYA",
] as const;

export type UnassignReasonCode = (typeof UNASSIGN_REASON_CODES)[number];

export const UNASSIGN_REASON_LABELS: Record<UnassignReasonCode, string> = {
  SALAH_TAP: "Salah tap",
  SHIFT_HABIS: "Shift habis",
  SAKIT: "Sakit / kendala fisik",
  KENDALA_TEKNIS: "Kendala teknis (device/koneksi)",
  LAINNYA: "Lainnya",
};

export function requiresNote(code: UnassignReasonCode | null): boolean {
  return code === "LAINNYA";
}
