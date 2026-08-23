import { z } from "zod";

import { PHONE_E164_REGEX } from "@/lib/phone";

export const locationFormSchema = z.object({
  locationName: z.string().min(1, "Nama lokasi wajib diisi").max(255),
  locationCode: z.string().min(1, "Kode lokasi wajib diisi").max(50),
  address: z.string().max(500).optional().or(z.literal("")),
  coordinate: z.string().max(100).optional().or(z.literal("")),
  provinceId: z.string().optional().or(z.literal("")),
  cityId: z.string().optional().or(z.literal("")),
  districtId: z.string().optional().or(z.literal("")),
  villageId: z.string().optional().or(z.literal("")),
  postCode: z.string().max(20).optional().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || PHONE_E164_REGEX.test(val), {
      message:
        "Format No. Telepon tidak valid. Gunakan format internasional (contoh: +628123456789)",
    }),
  email: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Format email tidak valid",
    }),
  defaultWarehouseUser: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((val) => !val || z.string().email().safeParse(val).success, {
      message: "Format email tidak valid",
    }),
  isWarehouse: z.boolean(),
  isActive: z.boolean(),
  isPos: z.boolean(),
});

export type LocationFormValues = z.infer<typeof locationFormSchema>;

export const layoutBuilderSchema = z
  .object({
    floorCode: z.string().min(1).max(10).default("L"),
    qtyFloor: z.coerce.number().int().min(1, "Minimal 1"),
    rowCode: z.string().min(1).max(10).default("B"),
    qtyRow: z.coerce.number().int().min(1, "Minimal 1"),
    columnCode: z.string().min(1).max(10).default("K"),
    qtyColumn: z.coerce.number().int().min(1, "Minimal 1"),
    binCode: z.string().min(1).max(10).default("R"),
    qtyBin: z.coerce.number().int().min(1, "Minimal 1"),
  })
  .refine((v) => v.qtyFloor * v.qtyRow * v.qtyColumn * v.qtyBin <= 2000, {
    message: "Maksimum kombinasi rak adalah 2000",
    path: ["qtyBin"],
  });

export type LayoutBuilderValues = z.infer<typeof layoutBuilderSchema>;
