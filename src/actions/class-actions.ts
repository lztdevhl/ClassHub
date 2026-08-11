"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { classSchema } from "@/schemas/class-schema";

function payload(formData: FormData) {
  return classSchema.safeParse({ name: formData.get("name"), description: formData.get("description"), status: formData.get("status") });
}

export async function createClass(formData: FormData): Promise<void> {
  await requireCurrentUser();
  const parsed = payload(formData);
  if (!parsed.success) redirect(`/turmas/nova?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  const duplicate = await prisma.classGroup.findFirst({ where: { name: { equals: parsed.data.name, mode: "insensitive" } }, select: { id: true } });
  if (duplicate) redirect(`/turmas/nova?error=${encodeURIComponent("Já existe uma turma com esse nome.")}`);
  const group = await prisma.classGroup.create({ data: parsed.data });
  revalidatePath("/turmas");
  redirect(`/turmas/${group.id}?success=${encodeURIComponent("Turma criada com sucesso.")}`);
}

export async function updateClass(id: string, formData: FormData): Promise<void> {
  await requireCurrentUser();
  const parsed = payload(formData);
  if (!parsed.success) redirect(`/turmas/${id}/editar?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  const duplicate = await prisma.classGroup.findFirst({ where: { id: { not: id }, name: { equals: parsed.data.name, mode: "insensitive" } }, select: { id: true } });
  if (duplicate) redirect(`/turmas/${id}/editar?error=${encodeURIComponent("Já existe uma turma com esse nome.")}`);
  await prisma.classGroup.update({ where: { id }, data: parsed.data });
  revalidatePath("/turmas"); revalidatePath(`/turmas/${id}`);
  redirect(`/turmas/${id}?success=${encodeURIComponent("Turma atualizada com sucesso.")}`);
}
