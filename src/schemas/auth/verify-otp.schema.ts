import { z } from "zod";

export const verifyOtpSchema = z.object({
  email: z.string().email({ message: "Format email tidak valid" }),
  otp: z
    .string()
    .length(6, "Kode OTP harus 6 digit")
    .regex(/^\d{6}$/, "Kode OTP hanya boleh angka"),
});

export type VerifyOtpValues = z.infer<typeof verifyOtpSchema>;
