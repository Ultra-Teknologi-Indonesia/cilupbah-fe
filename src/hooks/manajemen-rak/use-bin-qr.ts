"use client";

export {
  BIN_QR_PAPER_DEFAULT,
  type BinQrPaper,
} from "@/services/manajemen-rak/location.service";

import type { BinQrPaper } from "@/services/manajemen-rak/location.service";

export const BIN_QR_PAPER_OPTIONS: { value: BinQrPaper; label: string }[] = [
  { value: "thermal_50x40", label: "Thermal 50x40mm" },
  { value: "thermal_80x40", label: "Thermal 80x40mm" },
  { value: "a4_single", label: "A4 (1 QR per halaman)" },
  { value: "a4_multi", label: "A4 (8 QR per halaman)" },
];
