import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteStudent } from "@/actions/student-actions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function DeleteStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await prisma.student.findUnique({ where: { id }, select: { name: true, _count: { select: { lessons: true } } } });
  if (!student) notFound();

  const lessonSummary = student._count.lessons === 1 ? "1 aula vinculada também será excluída" : `${student._count.lessons} aulas vinculadas também serão excluídas`;

  return <div className="mx-auto max-w-xl"><PageHeader eyebrow="Confirmação" title="Excluir aluno?" description={`${student.name} e ${lessonSummary}. Esta ação não pode ser desfeita.`} /><div className="mt-6 flex flex-col-reverse gap-3 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-5 sm:flex-row sm:justify-end"><Button asChild variant="outline"><Link href={`/alunos/${id}`}>Cancelar</Link></Button><form action={deleteStudent.bind(null, id)}><input type="hidden" name="confirmed" value="yes" /><Button type="submit" className="w-full bg-[var(--danger)] hover:bg-[var(--danger)] sm:w-auto">Confirmar exclusão</Button></form></div></div>;
}
