import { describe, expect, it, vi } from "vitest";

import { PrismaAuthSessionRepository, PrismaAuthUserRepository } from "@/repositories/prisma-auth-repository";

describe("Prisma auth repositories", () => {
  it("maps an authenticated user returned by Prisma", async () => {
    const findUnique = vi.fn().mockResolvedValue({
      id: "user-1",
      name: "Administrador",
      email: "admin@edutrack.local",
      passwordHash: "password-hash",
    });
    const repository = new PrismaAuthUserRepository({ user: { findUnique } } as never);

    await expect(repository.findByEmail("admin@edutrack.local")).resolves.toEqual({
      id: "user-1",
      name: "Administrador",
      email: "admin@edutrack.local",
      passwordHash: "password-hash",
    });
  });

  it("returns null when a session token is absent", async () => {
    const findUnique = vi.fn().mockResolvedValue(null);
    const repository = new PrismaAuthSessionRepository({ session: { findUnique } } as never);

    await expect(repository.findByTokenHash("missing-token-hash")).resolves.toBeNull();
  });

  it("maps a session and its related user", async () => {
    const expiresAt = new Date("2026-08-13T12:00:00.000Z");
    const findUnique = vi.fn().mockResolvedValue({
      tokenHash: "token-hash",
      expiresAt,
      user: { id: "user-1", name: "Administrador", email: "admin@edutrack.local" },
    });
    const repository = new PrismaAuthSessionRepository({ session: { findUnique } } as never);

    await expect(repository.findByTokenHash("token-hash")).resolves.toEqual({
      tokenHash: "token-hash",
      expiresAt,
      user: { id: "user-1", name: "Administrador", email: "admin@edutrack.local" },
    });
  });

  it("revokes an absent session without surfacing a record-not-found error", async () => {
    const deleteMany = vi.fn().mockResolvedValue({ count: 0 });
    const repository = new PrismaAuthSessionRepository({ session: { deleteMany } } as never);

    await expect(repository.deleteByTokenHash("missing-token-hash")).resolves.toBeUndefined();
  });
});
