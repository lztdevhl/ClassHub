import { createStudent } from "@/actions/student-actions";
import { StudentForm } from "@/components/students/student-form";
import { Feedback } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function NewStudentPage({ searchParams }: { searchParams: Promise<{ error?: string; classId?: string }> }) { const params = await searchParams; const classes = await prisma.classGroup.findMany({ where: { status: "ACTIVE" }, orderBy: { name: "asc" }, select: { id: true, name: true } }); return <div className="mx-auto max-w-3xl"><PageHeader title="Novo aluno" description="Cadastre os dados básicos. Contato, turma e observações são opcionais." /><Feedback error={params.error} /><StudentForm action={createStudent} classes={classes} initial={{ classId: params.classId ?? "" }} /></div>; }
