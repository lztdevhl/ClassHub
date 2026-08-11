import { z } from "zod";

const optionalText = (max: number) => z.string().trim().max(max).transform((value) => value || undefined);

export const studentSchema = z.object({
  name: z.string().trim().min(2, "Nome é obrigatório.").max(150),
  email: z.union([z.literal(""), z.string().trim().email("Informe um email válido.")]).transform((v) => v || undefined),
  phone: optionalText(30),
  generalNotes: optionalText(5000),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  classId: z.string().trim().transform((value) => value || undefined),
});

export type StudentInput = z.infer<typeof studentSchema>;
