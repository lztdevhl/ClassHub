import { Search } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/feedback";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDate, parseDateOnly } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type Params = { q?: string; studentId?: string; from?: string; to?: string; attendance?: string; activity?: string };

export default async function LessonsPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams; const students = await prisma.student.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const lessons = await prisma.lesson.findMany({ where: { studentId: p.studentId || undefined, student: p.q ? { name: { contains: p.q, mode: "insensitive" } } : undefined, lessonDate: p.from || p.to ? { gte: p.from ? parseDateOnly(p.from) : undefined, lte: p.to ? parseDateOnly(p.to) : undefined } : undefined, attendanceStatus: p.attendance === "PRESENT" || p.attendance === "ABSENT" ? p.attendance : undefined, activityCompleted: p.activity === "true" ? true : p.activity === "false" ? false : undefined }, orderBy: [{ lessonDate: "desc" }, { createdAt: "desc" }], include: { student: { select: { id: true, name: true } } } });
  return <div className="page-stack"><PageHeader title="Aulas" description="Consulte o histórico completo e combine os filtros existentes." actions={<Button asChild><Link href="/aulas/nova">Nova aula</Link></Button>} />
    <form className="filter-toolbar md:grid-cols-3 xl:grid-cols-[minmax(180px,1fr)_minmax(180px,1fr)_150px_150px_150px_150px_auto]"><div className="relative"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" size={16} /><input name="q" defaultValue={p.q} placeholder="Buscar aluno" className="pl-9" /></div><select name="studentId" defaultValue={p.studentId}><option value="">Todos os alunos</option>{students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select><input type="date" name="from" defaultValue={p.from} aria-label="Data inicial" className="px-2" /><input type="date" name="to" defaultValue={p.to} aria-label="Data final" className="px-2" /><select name="attendance" defaultValue={p.attendance}><option value="">Toda presença</option><option value="PRESENT">Presente</option><option value="ABSENT">Falta</option></select><select name="activity" defaultValue={p.activity}><option value="">Toda atividade</option><option value="true">Concluída</option><option value="false">Pendente</option></select><Button type="submit" variant="outline">Aplicar</Button></form>
    <div><p className="mb-3 text-[13px] text-[var(--muted)]">{lessons.length} {lessons.length === 1 ? "registro encontrado" : "registros encontrados"}</p>{lessons.length === 0 ? <EmptyState title="Nenhuma aula encontrada" description="Ajuste os filtros ou registre uma nova aula." /> : <div className="table-shell"><table className="data-table min-w-[900px]"><thead><tr><th>Data</th><th>Aluno</th><th>Presença</th><th>Conteúdo</th><th>Atividade</th><th>Status</th><th></th></tr></thead><tbody>{lessons.map((l) => <tr key={l.id}><td>{formatDate(l.lessonDate)}</td><td className="primary-cell"><Link href={`/alunos/${l.student.id}`}>{l.student.name}</Link></td><td><StatusBadge tone={l.attendanceStatus === "PRESENT" ? "green" : "red"}>{l.attendanceStatus === "PRESENT" ? "Presente" : "Falta"}</StatusBadge></td><td className="secondary-cell max-w-60 truncate">{l.content || "—"}</td><td className="secondary-cell max-w-60 truncate">{l.activity || "—"}</td><td><StatusBadge tone={l.activityCompleted ? "green" : "amber"}>{l.activityCompleted ? "Concluída" : "Pendente"}</StatusBadge></td><td><Link href={`/aulas/${l.id}/editar`} className="section-link">Editar</Link></td></tr>)}</tbody></table></div>}</div>
  </div>;
}
