import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { percent } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export default async function ClassesPage() {
  const groups = await prisma.classGroup.findMany({ orderBy: { name: "asc" }, include: { students: { select: { status: true, lessons: { select: { attendanceStatus: true, activityCompleted: true } } } } } });
  return <div className="page-stack"><PageHeader title="Turmas" description="Organize seus alunos e acompanhe o desempenho de cada turma." actions={<Button asChild><Link href="/turmas/nova">Nova turma</Link></Button>} />{groups.length === 0 ? <EmptyState title="Nenhuma turma cadastrada" description="Crie sua primeira turma para organizar seus alunos." /> : <div className="table-shell"><table className="data-table min-w-[800px]"><thead><tr><th>Nome</th><th>Alunos</th><th>Aulas</th><th>Presença</th><th>Faltas</th><th>Pendências</th><th>Status</th></tr></thead><tbody>{groups.map((group) => { const lessons = group.students.flatMap((student) => student.lessons); const present = lessons.filter((lesson) => lesson.attendanceStatus === "PRESENT").length; return <tr key={group.id}><td className="primary-cell"><Link href={`/turmas/${group.id}`}>{group.name}</Link></td><td>{group.students.filter((student) => student.status === "ACTIVE").length}</td><td>{lessons.length}</td><td>{percent(present, lessons.length)}%</td><td>{lessons.length - present}</td><td>{lessons.filter((lesson) => lesson.activityCompleted === false).length}</td><td><StatusBadge tone={group.status === "ACTIVE" ? "green" : "gray"}>{group.status === "ACTIVE" ? "Ativa" : "Inativa"}</StatusBadge></td></tr>; })}</tbody></table></div>}</div>;
}
