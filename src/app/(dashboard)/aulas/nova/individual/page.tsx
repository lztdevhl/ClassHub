import { createLesson } from "@/actions/lesson-actions";
import { LessonForm } from "@/components/lessons/lesson-form";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function NewIndividualLessonPage({ searchParams }: { searchParams: Promise<{ studentId?: string; error?: string }> }) { const p = await searchParams; const students = await prisma.student.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } }); return <div className="mx-auto max-w-3xl"><PageHeader title="Registrar aula individual" description="O registro atualiza automaticamente indicadores, histórico e pendências." /><Feedback error={p.error} /><LessonForm action={createLesson} students={students} initial={{ studentId: p.studentId ?? "" }} /></div>; }
