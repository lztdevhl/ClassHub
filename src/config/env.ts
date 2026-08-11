import { z } from "zod";

import { initialAdminPasswordSchema } from "@/config/initial-admin-password";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url().startsWith("postgres"),
  DIRECT_URL: z.string().url().startsWith("postgres"),
  INITIAL_ADMIN_NAME: z.string().trim().min(2).max(100),
  INITIAL_ADMIN_EMAIL: z.string().trim().toLowerCase().email(),
  INITIAL_ADMIN_PASSWORD: initialAdminPasswordSchema,
  SESSION_SECRET: z.string().min(32),
  APP_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(source);
}
