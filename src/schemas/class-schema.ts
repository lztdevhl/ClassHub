import { z } from "zod";

export const classSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório.").max(120),
  description: z.string().trim().max(5000).transform((value) => value || undefined),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
