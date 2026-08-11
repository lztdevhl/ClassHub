import { beforeEach, describe, expect, it } from "vitest";

import { hashPassword } from "@/lib/auth/password";
import { hashSessionToken } from "@/lib/auth/token";
import type { AuthUser, StoredSession } from "@/lib/auth/types";
import type { AuthSessionRepository, AuthUserRepository } from "@/repositories/auth-repository";
import { authenticate, createSession, revokeSession, validateSession } from "@/services/auth-service";

class MemoryUsers implements AuthUserRepository {
  constructor(private readonly users: AuthUser[]) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    return this.users.find((user) => user.email === email) ?? null;
  }

  findById(id: string): AuthUser | null {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

class MemorySessions implements AuthSessionRepository {
  readonly rows = new Map<string, { userId: string; expiresAt: Date }>();
  readonly deleted: string[] = [];

  constructor(private readonly users: MemoryUsers) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    this.rows.set(input.tokenHash, { userId: input.userId, expiresAt: input.expiresAt });
  }

  async findByTokenHash(tokenHash: string): Promise<StoredSession | null> {
    const row = this.rows.get(tokenHash);
    if (!row) return null;

    const user = this.users.findById(row.userId);
    if (!user) return null;

    return { tokenHash, expiresAt: row.expiresAt, user: { id: user.id, name: user.name, email: user.email } };
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    this.deleted.push(tokenHash);
    this.rows.delete(tokenHash);
  }
}

describe("auth service", () => {
  let users: MemoryUsers;
  let sessions: MemorySessions;
  const now = new Date("2026-08-06T12:00:00.000Z");
  const sessionSecret = "12345678901234567890123456789012";

  beforeEach(async () => {
    users = new MemoryUsers([{
      id: "user-1",
      name: "Administrador",
      email: "admin@classhub.local",
      passwordHash: await hashPassword("senha-correta-123"),
    }]);
    sessions = new MemorySessions(users);
  });

  const makeDeps = () => ({ users, sessions, now: () => now, sessionSecret });

  it("accepts the correct password and creates an opaque session", async () => {
    const deps = makeDeps();
    const auth = await authenticate({ email: " ADMIN@CLASSHUB.LOCAL ", password: "senha-correta-123" }, deps);

    expect(auth).toMatchObject({ ok: true, user: { id: "user-1" } });

    const session = await createSession("user-1", deps);

    expect(session.token).not.toContain("user-1");
    expect(sessions.rows.has(hashSessionToken(session.token, sessionSecret))).toBe(true);
    expect(session.expiresAt).toEqual(new Date("2026-08-13T12:00:00.000Z"));
  });

  it("returns invalid_credentials for an unknown email", async () => {
    await expect(authenticate({ email: "unknown@classhub.local", password: "qualquer-senha" }, makeDeps()))
      .resolves.toEqual({ ok: false, reason: "invalid_credentials" });
  });

  it("returns invalid_credentials for a wrong password", async () => {
    await expect(authenticate({ email: "admin@classhub.local", password: "senha-incorreta" }, makeDeps()))
      .resolves.toEqual({ ok: false, reason: "invalid_credentials" });
  });

  it("returns null for an expired session and deletes it", async () => {
    const token = "expired-token";
    const tokenHash = hashSessionToken(token, sessionSecret);
    sessions.rows.set(tokenHash, { userId: "user-1", expiresAt: new Date("2026-08-05T12:00:00.000Z") });

    await expect(validateSession(token, makeDeps())).resolves.toBeNull();
    expect(sessions.deleted).toContain(tokenHash);
  });

  it("expires a session at the exact current instant", async () => {
    const token = "just-expired-token";
    const tokenHash = hashSessionToken(token, sessionSecret);
    sessions.rows.set(tokenHash, { userId: "user-1", expiresAt: now });

    await expect(validateSession(token, makeDeps())).resolves.toBeNull();
    expect(sessions.deleted).toContain(tokenHash);
  });

  it("returns the stored user for an active session", async () => {
    const token = "active-token";
    const tokenHash = hashSessionToken(token, sessionSecret);
    sessions.rows.set(tokenHash, { userId: "user-1", expiresAt: new Date("2026-08-07T12:00:00.000Z") });

    await expect(validateSession(token, makeDeps())).resolves.toEqual({
      id: "user-1",
      name: "Administrador",
      email: "admin@classhub.local",
    });
  });

  it("revokes a session by the hash of its raw token", async () => {
    const token = "active-token";
    const tokenHash = hashSessionToken(token, sessionSecret);
    sessions.rows.set(tokenHash, { userId: "user-1", expiresAt: new Date("2026-08-07T12:00:00.000Z") });

    await revokeSession(token, makeDeps());

    expect(sessions.deleted).toContain(tokenHash);
  });

  it("allows revoking a session that was already removed", async () => {
    await expect(revokeSession("missing-token", makeDeps())).resolves.toBeUndefined();
  });
});
