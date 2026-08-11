"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireCurrentUser } from "@/lib/auth/session";
import { parseDateOnly } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { lessonSchema } from "@/schemas/lesson-schema";

function lessonPayload(formData: FormData) {
  return lessonSchema.safeParse({
    studentId: formData.get("studentId"), lessonDate: formData.get("lessonDate"),
    attendanceStatus: formData.get("attendanceStatus"), content: formData.get("content"),
    activity: formData.get("activity"), activityCompleted: formData.get("activityCompleted"),
    notes: formData.get("notes"), nextSteps: formData.get("nextSteps"),
  });
}

function refresh(studentId?: string) {
  revalidatePath("/dashboard"); revalidatePath("/aulas"); revalidatePath("/alunos");
  revalidatePath("/pendencias"); revalidatePath("/relatorios");
  if (studentId) revalidatePath(`/alunos/${studentId}`);
}

export async function createLesson(formData: FormData): Promise<void> {
  await requireCurrentUser();
  const parsed = lessonPayload(formData);
  if (!parsed.success) redirect(`/aulas/nova/individual?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  const student = await prisma.student.findUnique({ where: { id: parsed.data.studentId }, select: { classId: true } });
  const lesson = await prisma.lesson.create({ data: { ...parsed.data, classId: student?.classId, lessonDate: parseDateOnly(parsed.data.lessonDate) } });
  refresh(lesson.studentId);
  redirect(`/alunos/${lesson.studentId}?success=${encodeURIComponent("Aula registrada com sucesso.")}`);
}

export async function createClassLessons(classId: string, formData: FormData): Promise<void> {
  await requireCurrentUser();
  const group = await prisma.classGroup.findUnique({ where: { id: classId }, include: { students: { where: { status: "ACTIVE" }, select: { id: true } } } });
  if (!group || group.status !== "ACTIVE") redirect(`/aulas/nova/turma?error=${encodeURIComponent("Turma não encontrada.")}`);
  const lessonDate = String(formData.get("lessonDate") ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(lessonDate)) redirect(`/aulas/nova/turma?classId=${classId}&error=${encodeURIComponent("Informe a data da aula.")}`);
  const common = { content: String(formData.get("content") ?? "").trim() || null, activity: String(formData.get("activity") ?? "").trim() || null, nextSteps: String(formData.get("nextSteps") ?? "").trim() || null };
  const rows = group.students.map((student) => ({ studentId: student.id, attendanceStatus: formData.get(`attendance:${student.id}`), activityCompleted: formData.get(`completed:${student.id}`), notes: String(formData.get(`notes:${student.id}`) ?? "").trim() || null, content: String(formData.get(`content:${student.id}`) ?? "").trim() || common.content, activity: String(formData.get(`activity:${student.id}`) ?? "").trim() || common.activity, nextSteps: String(formData.get(`nextSteps:${student.id}`) ?? "").trim() || common.nextSteps }));
  if (!rows.length) redirect(`/aulas/nova/turma?classId=${classId}&error=${encodeURIComponent("Esta turma não possui alunos ativos.")}`);
  if (rows.some((row) => row.attendanceStatus !== "PRESENT" && row.attendanceStatus !== "ABSENT")) redirect(`/aulas/nova/turma?classId=${classId}&error=${encodeURIComponent("Existem alunos sem presença definida.")}`);
  if (rows.some((row) => row.activityCompleted !== "true" && row.activityCompleted !== "false")) redirect(`/aulas/nova/turma?classId=${classId}&error=${encodeURIComponent("Defina o status da atividade para todos os alunos.")}`);
  await prisma.$transaction(async (tx) => { await tx.lesson.createMany({ data: rows.map((row) => ({ studentId: row.studentId, classId, lessonDate: parseDateOnly(lessonDate), attendanceStatus: row.attendanceStatus as "PRESENT" | "ABSENT", activityCompleted: row.activityCompleted === "true", notes: row.notes, content: row.content, activity: row.activity, nextSteps: row.nextSteps })) }); });
  refresh(); revalidatePath(`/turmas/${classId}`);
  redirect(`/turmas/${classId}?success=${encodeURIComponent(`Aula registrada para ${rows.length} alunos da turma ${group.name}.`)}`);
}

export async function updateLesson(id: string, formData: FormData): Promise<void> {
  await requireCurrentUser();
  const parsed = lessonPayload(formData);
  if (!parsed.success) redirect(`/aulas/${id}/editar?error=${encodeURIComponent(parsed.error.issues[0]?.message ?? "Dados inválidos.")}`);
  const lesson = await prisma.lesson.update({ where: { id }, data: { ...parsed.data, lessonDate: parseDateOnly(parsed.data.lessonDate) } });
  refresh(lesson.studentId);
  redirect(`/alunos/${lesson.studentId}?success=${encodeURIComponent("Aula atualizada com sucesso.")}`);
}

export async function deleteLesson(id: string, formData: FormData): Promise<void> {
  await requireCurrentUser();
  if (formData.get("confirmed") !== "yes") redirect(`/aulas/${id}/excluir`);
  const lesson = await prisma.lesson.delete({ where: { id } });
  refresh(lesson.studentId);
  redirect(`/alunos/${lesson.studentId}?success=${encodeURIComponent("Aula excluída.")}`);
}

export async function completeActivity(id: string): Promise<void> {
  await requireCurrentUser();
  const lesson = await prisma.lesson.update({ where: { id }, data: { activityCompleted: true } });
  refresh(lesson.studentId);
  redirect(`/pendencias?success=${encodeURIComponent("Atividade marcada como concluída.")}`);
}
