import { z } from "zod";

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "Kata sandi saat ini wajib diisi"),
    new_password: z
      .string()
      .min(8, "Kata sandi baru minimal 8 karakter")
      .max(64, "Kata sandi baru maksimal 64 karakter")
      .regex(/[A-Za-z]/, { message: "Kata sandi baru wajib memuat setidaknya satu huruf" })
      .regex(/\d/, { message: "Kata sandi baru wajib memuat setidaknya satu angka" }),
    new_password_confirmation: z
      .string()
      .min(1, "Konfirmasi kata sandi baru wajib diisi"),
  })
  .refine((data) => data.new_password === data.new_password_confirmation, {
    path: ["new_password_confirmation"],
    message: "Konfirmasi kata sandi baru tidak cocok",
  })
  .refine((data) => data.new_password !== data.current_password, {
    path: ["new_password"],
    message: "Kata sandi baru tidak boleh sama dengan kata sandi saat ini",
  });

export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
