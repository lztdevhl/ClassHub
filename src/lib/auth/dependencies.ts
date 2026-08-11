import "server-only";

import { serverEnv } from "@/config/server-env";
import { prisma } from "@/lib/prisma";
import { PrismaAuthSessionRepository, PrismaAuthUserRepository } from "@/repositories/prisma-auth-repository";
import { PrismaLoginThrottleRepository } from "@/repositories/prisma-login-throttle-repository";
import type { AuthDependencies } from "@/services/auth-service";

export const authDependencies: AuthDependencies = {
  users: new PrismaAuthUserRepository(prisma),
  sessions: new PrismaAuthSessionRepository(prisma),
  now: () => new Date(),
  sessionSecret: serverEnv.SESSION_SECRET,
};

export const loginThrottleRepository = new PrismaLoginThrottleRepository(prisma);
