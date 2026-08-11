import { z } from "zod";

import { initialAdminPasswordSchema } from "@/config/initial-admin-password";

const seedAdminSchema = z.object({
  INITIAL_ADMIN_NAME: z.string().trim().min(2).max(100),
  INITIAL_ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
  INITIAL_ADMIN_PASSWORD: initialAdminPasswordSchema,
});

export type SeedAdmin = { name: string; email: string; password: string };

export function parseSeedAdmin(source: Record<string, string | undefined>): SeedAdmin {
  const parsed = seedAdminSchema.parse(source);

  return {
    name: parsed.INITIAL_ADMIN_NAME,
    email: parsed.INITIAL_ADMIN_EMAIL,
    password: parsed.INITIAL_ADMIN_PASSWORD,
  };
}
