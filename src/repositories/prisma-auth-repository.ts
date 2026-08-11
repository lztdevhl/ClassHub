import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthUser, StoredSession } from "@/lib/auth/types";
import type { AuthSessionRepository, AuthUserRepository } from "@/repositories/auth-repository";

export class PrismaAuthUserRepository implements AuthUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<AuthUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    return user;
  }
}

export class PrismaAuthSessionRepository implements AuthSessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: { userId: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await this.prisma.session.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<StoredSession | null> {
    const session = await this.prisma.session.findUnique({
      where: { tokenHash },
      select: {
        tokenHash: true,
        expiresAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return session;
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { tokenHash } });
  }
}
