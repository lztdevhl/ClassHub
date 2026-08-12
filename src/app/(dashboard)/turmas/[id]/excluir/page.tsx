import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteClass } from "@/actions/class-actions";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { prisma } from "@/lib/prisma";

export default async function DeleteClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await prisma.classGroup.findUnique({ where: { id }, select: { name: true, _count: { select: { students: true, lessons: true } } } });
  if (!group) notFound();

  const linkedRecords = `${group._count.students} ${group._count.students === 1 ? "aluno" : "alunos"} e ${group._count.lessons} ${group._count.lessons === 1 ? "aula" : "aulas"}`;

  return <div className="mx-auto max-w-xl"><PageHeader eyebrow="Confirmação" title="Excluir turma?" description={`${group.name} será excluída. ${linkedRecords} serão preservados e apenas desvinculados da turma.`} /><div className="mt-6 flex flex-col-reverse gap-3 rounded-xl border border-[var(--danger)]/20 bg-[var(--danger-soft)] p-5 sm:flex-row sm:justify-end"><Button asChild variant="outline"><Link href={`/turmas/${id}`}>Cancelar</Link></Button><form action={deleteClass.bind(null, id)}><input type="hidden" name="confirmed" value="yes" /><Button type="submit" className="w-full bg-[var(--danger)] hover:bg-[var(--danger)] sm:w-auto">Confirmar exclusão</Button></form></div></div>;
}
