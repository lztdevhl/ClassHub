import type { AuthUser, StoredSession } from "@/lib/auth/types";

export interface AuthUserRepository {
  findByEmail(email: string): Promise<AuthUser | null>;
}

export interface AuthSessionRepository {
  create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<StoredSession | null>;
  deleteByTokenHash(tokenHash: string): Promise<void>;
}
