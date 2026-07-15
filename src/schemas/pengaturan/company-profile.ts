import { z } from "zod";

export const companyProfileSchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(1, "Nama perusahaan wajib diisi")
    .max(255, "Maksimal 255 karakter"),
  address: z.string().trim().max(1000).nullish(),
  city: z.string().trim().max(255).nullish(),
  postalCode: z.string().trim().max(16).nullish(),
  phone: z.string().trim().max(32).nullish(),
  email: z
    .union([z.literal(""), z.string().email("Format email tidak valid")])
    .nullish(),
  logoMediaId: z.string().uuid().nullish(),
  signatureMediaId: z.string().uuid().nullish(),
});

export type CompanyProfileFormValues = z.infer<typeof companyProfileSchema>;
