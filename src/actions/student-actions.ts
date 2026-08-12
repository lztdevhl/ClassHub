"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { studentSchema } from "@/schemas/student-schema";

function studentPayload(formData: FormData) {
  return studentSchema.safeParse({
    name: formData.get("name"), email: formData.get("email"), phone: formData.get("phone"),
    generalNotes: formData.get("generalNotes"), status: formData.get("status"), classId: formData.get("classId"),
  });
}

export async function createStudent(formData: FormData): Promise<void> {
  await requireCurrentUser();
  const parsed = studentPayload(formData);
  if (!parsed.success) redirect(`/alunos/novo?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  if (parsed.data.classId && !await prisma.classGroup.findFirst({ where: { id: parsed.data.classId, status: "ACTIVE" }, select: { id: true } })) redirect(`/alunos/novo?error=${encodeURIComponent("Turma não encontrada.")}`);
  const student = await prisma.student.create({ data: parsed.data });
  revalidatePath("/dashboard"); revalidatePath("/alunos");
  redirect(`/alunos/${student.id}?success=${encodeURIComponent("Aluno cadastrado com sucesso.")}`);
}

export async function updateStudent(id: string, formData: FormData): Promise<void> {
  await requireCurrentUser();
  const parsed = studentPayload(formData);
  if (!parsed.success) redirect(`/alunos/${id}/editar?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  if (parsed.data.classId && !await prisma.classGroup.findUnique({ where: { id: parsed.data.classId }, select: { id: true } })) redirect(`/alunos/${id}/editar?error=${encodeURIComponent("Turma não encontrada.")}`);
  await prisma.student.update({ where: { id }, data: parsed.data });
  revalidatePath("/dashboard"); revalidatePath("/alunos"); revalidatePath(`/alunos/${id}`);
  redirect(`/alunos/${id}?success=${encodeURIComponent("Aluno atualizado com sucesso.")}`);
}

export async function archiveStudent(id: string): Promise<void> {
  await requireCurrentUser();
  await prisma.student.update({ where: { id }, data: { status: "INACTIVE" } });
  revalidatePath("/dashboard"); revalidatePath("/alunos"); revalidatePath(`/alunos/${id}`);
  redirect(`/alunos/${id}?success=${encodeURIComponent("Aluno arquivado. O histórico foi preservado.")}`);
}

export async function deleteStudent(id: string, formData: FormData): Promise<void> {
  await requireCurrentUser();
  if (formData.get("confirmed") !== "yes") redirect(`/alunos/${id}/excluir`);

  await prisma.$transaction(async (transaction) => {
    await transaction.lesson.deleteMany({ where: { studentId: id } });
    await transaction.student.delete({ where: { id } });
  });

  revalidatePath("/dashboard"); revalidatePath("/alunos"); revalidatePath("/aulas");
  revalidatePath("/pendencias"); revalidatePath("/relatorios"); revalidatePath("/turmas");
  redirect(`/alunos?success=${encodeURIComponent("Aluno e histórico de aulas excluídos.")}`);
}
