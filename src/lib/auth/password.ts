import bcrypt from "bcrypt";

import { initialAdminPasswordSchema } from "@/config/initial-admin-password";

import { BCRYPT_COST } from "@/lib/auth/constants";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(initialAdminPasswordSchema.parse(password), BCRYPT_COST);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
  if (!initialAdminPasswordSchema.safeParse(password).success) {
    return false;
  }

  return bcrypt.compare(password, passwordHash);
}
