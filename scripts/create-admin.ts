import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { emitKeypressEvents } from "node:readline";
import { createInterface } from "node:readline/promises";
import { z } from "zod";

import { initialAdminPasswordSchema } from "../src/config/initial-admin-password";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/auth/password";

const adminSchema = z.object({
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres.").max(100),
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  password: initialAdminPasswordSchema,
});

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  if (index >= 0) return process.argv[index + 1];
  return process.argv.find((value) => value.startsWith(`--${name}=`))?.slice(name.length + 3);
}

async function hiddenPrompt(label: string): Promise<string> {
  if (!process.stdin.isTTY || !process.stdout.isTTY || !process.stdin.setRawMode) {
    throw new Error("Execute este comando em um terminal interativo para informar a senha com segurança.");
  }

  emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdout.write(label);

  return new Promise((resolve, reject) => {
    let value = "";
    const finish = () => {
      process.stdin.off("keypress", onKeypress);
      process.stdin.setRawMode(false);
      process.stdin.pause();
      process.stdout.write("\n");
    };
    const onKeypress = (character: string, key: { name?: string; ctrl?: boolean; meta?: boolean }) => {
      if (key.ctrl && key.name === "c") {
        finish();
        reject(new Error("Operação cancelada."));
      } else if (key.name === "return" || key.name === "enter") {
        finish();
        resolve(value);
      } else if (key.name === "backspace") {
        if (value) {
          value = value.slice(0, -1);
          process.stdout.write("\b \b");
        }
      } else if (character && !key.ctrl && !key.meta) {
        value += character;
        process.stdout.write("*");
      }
    };
    process.stdin.on("keypress", onKeypress);
  });
}

async function main() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) throw new Error("Configure DIRECT_URL ou DATABASE_URL antes de criar o professor.");

  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const name = argument("name") ?? await prompt.question("Nome do professor: ");
  const email = argument("email") ?? await prompt.question("E-mail do professor: ");
  prompt.close();

  const password = await hiddenPrompt("Senha: ");
  const confirmation = await hiddenPrompt("Confirme a senha: ");
  if (password !== confirmation) throw new Error("As senhas não coincidem.");

  const admin = adminSchema.parse({ name, email, password });
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

  try {
    const existing = await prisma.user.findUnique({ where: { email: admin.email }, select: { id: true } });
    if (existing) throw new Error(`Já existe um usuário com o e-mail ${admin.email}. Nenhum dado foi alterado.`);

    await prisma.user.create({
      data: { name: admin.name, email: admin.email, passwordHash: await hashPassword(admin.password), settings: { create: {} } },
    });
    console.info(`Professor ${admin.email} criado com sucesso.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Erro desconhecido.";
  console.error(`Não foi possível criar o professor: ${message}`);
  process.exitCode = 1;
});
