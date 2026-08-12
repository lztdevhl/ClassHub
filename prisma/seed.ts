import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";

import { PrismaClient } from "../src/generated/prisma/client";
import { parseSeedAdmin } from "../src/lib/seed-env";

const admin = parseSeedAdmin(process.env);
const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL ou DIRECT_URL deve estar configurada para executar o seed.");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const passwordHash = await bcrypt.hash(admin.password, 12);
  await prisma.user.upsert({ where: { email: admin.email }, create: { name: admin.name, email: admin.email, passwordHash, settings: { create: {} } }, update: { name: admin.name, passwordHash } });
  console.info("Administrador inicial do ClassHub provisionado.");
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; }).finally(async () => prisma.$disconnect());
