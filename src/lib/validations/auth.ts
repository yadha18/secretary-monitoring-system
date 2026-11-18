import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Format email tidak valid.").max(200).transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Password wajib diisi.").max(200),
});

export type LoginInput = z.input<typeof loginSchema>;
