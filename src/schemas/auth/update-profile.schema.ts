import { z } from "zod";

import { PHONE_E164_REGEX } from "@/lib/phone";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi")
    .max(120, "Nama maksimal 120 karakter"),
  nik: z
    .string()
    .trim()
    .max(32, "NIK maksimal 32 karakter")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || PHONE_E164_REGEX.test(value),
      "Nomor telepon tidak valid",
    )
    .optional()
    .or(z.literal("")),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
