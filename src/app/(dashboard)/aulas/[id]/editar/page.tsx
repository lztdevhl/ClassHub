import { notFound } from "next/navigation";

import { updateLesson } from "@/actions/lesson-actions";
import { LessonForm } from "@/components/lessons/lesson-form";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { toDateInput } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function EditLessonPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) { const [{ id }, { error }] = await Promise.all([params, searchParams]); const [lesson, students] = await Promise.all([prisma.lesson.findUnique({ where: { id } }), prisma.student.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })]); if (!lesson) notFound(); return <div className="mx-auto max-w-3xl"><PageHeader eyebrow="Aulas" title="Editar aula" /><Feedback error={error} /><LessonForm action={updateLesson.bind(null, id)} students={students} submitLabel="Salvar alterações" initial={{ studentId: lesson.studentId, lessonDate: toDateInput(lesson.lessonDate), attendanceStatus: lesson.attendanceStatus, content: lesson.content ?? "", activity: lesson.activity ?? "", activityCompleted: lesson.activityCompleted ? "true" : "false", notes: lesson.notes ?? "", nextSteps: lesson.nextSteps ?? "" }} /></div>; }
