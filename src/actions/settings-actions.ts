"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { initialAdminPasswordSchema } from "@/config/initial-admin-password";
import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function updateProfile(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2 || name.length > 100) redirect(`/configuracoes?error=${encodeURIComponent("Informe um nome válido.")}`);
  await prisma.user.update({ where: { id: user.id }, data: { name } });
  revalidatePath("/configuracoes");
  redirect(`/configuracoes?success=${encodeURIComponent("Perfil atualizado.")}`);
}

export async function changePassword(formData: FormData): Promise<void> {
  const user = await requireCurrentUser();
  const password = String(formData.get("password") ?? "");
  const parsed = initialAdminPasswordSchema.safeParse(password);
  if (!parsed.success) redirect(`/configuracoes?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Senha inválida.")}`);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(parsed.data, 12), sessions: { deleteMany: { id: { not: "" } } } } });
  redirect("/login");
}
