import { SESSION_DURATION_MS } from "@/lib/auth/constants";
import { verifyPassword } from "@/lib/auth/password";
import { generateSessionToken, hashSessionToken } from "@/lib/auth/token";
import type { SessionUser } from "@/lib/auth/types";
import type { AuthSessionRepository, AuthUserRepository } from "@/repositories/auth-repository";

const UNKNOWN_PASSWORD_HASH = "$2b$12$LQv3c1yqBw9T7D4X23jo9esbujxYpmLHu5o1wMDe3EyqVctBiBquW";

export type AuthDependencies = {
  users: AuthUserRepository;
  sessions: AuthSessionRepository;
  now: () => Date;
  sessionSecret: string;
};

export async function authenticate(
  input: { email: string; password: string },
  deps: AuthDependencies,
): Promise<{ ok: true; user: SessionUser } | { ok: false; reason: "invalid_credentials" }> {
  const user = await deps.users.findByEmail(input.email.trim().toLowerCase());
  const passwordMatches = await verifyPassword(input.password, user?.passwordHash ?? UNKNOWN_PASSWORD_HASH);

  if (!user || !passwordMatches) {
    return { ok: false, reason: "invalid_credentials" };
  }

  return { ok: true, user: { id: user.id, name: user.name, email: user.email } };
}

export async function createSession(
  userId: string,
  deps: AuthDependencies,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const expiresAt = new Date(deps.now().getTime() + SESSION_DURATION_MS);

  await deps.sessions.create({
    userId,
    tokenHash: hashSessionToken(token, deps.sessionSecret),
    expiresAt,
  });

  return { token, expiresAt };
}

export async function validateSession(token: string, deps: AuthDependencies): Promise<SessionUser | null> {
  const tokenHash = hashSessionToken(token, deps.sessionSecret);
  const session = await deps.sessions.findByTokenHash(tokenHash);

  if (!session) {
    return null;
  }

  if (session.expiresAt <= deps.now()) {
    await deps.sessions.deleteByTokenHash(tokenHash);
    return null;
  }

  return session.user;
}

export async function revokeSession(token: string, deps: AuthDependencies): Promise<void> {
  await deps.sessions.deleteByTokenHash(hashSessionToken(token, deps.sessionSecret));
}
