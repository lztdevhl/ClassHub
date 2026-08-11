export type SessionUser = { id: string; name: string; email: string };

export type AuthUser = SessionUser & { passwordHash: string };

export type StoredSession = {
  user: SessionUser;
  tokenHash: string;
  expiresAt: Date;
};
