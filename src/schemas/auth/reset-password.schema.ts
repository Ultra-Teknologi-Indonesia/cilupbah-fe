import { z } from "zod";

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .max(64, "Kata sandi maksimal 64 karakter")
      .regex(/[A-Z]/, "Harus mengandung huruf besar")
      .regex(/[a-z]/, "Harus mengandung huruf kecil")
      .regex(/\d/, "Harus mengandung angka")
      .regex(/[^A-Za-z0-9]/, "Harus mengandung karakter spesial"),
    password_confirmation: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    path: ["password_confirmation"],
    message: "Konfirmasi kata sandi tidak sama",
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
