import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { serverEnv } from "@/config/server-env";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (serverEnv.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
